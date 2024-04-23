export class ECPoint {
	constructor(
		public x: bigint,
		public y: bigint
	) {}
}

export class EncryptedMessage {
	constructor(
		public x: ECPoint,
		public y: ECPoint
	) {}
}

export class Curve {
	constructor(
		public A: bigint,
		public B: bigint,
		public Fp: bigint
	) {}

	static alt_bn128(): Curve {
		return new Curve(
			BigInt(0),
			BigInt(3),
			BigInt('21888242871839275222246405745257275088696311157297823662689037894645226208583')
		);
	}

	positiveMod(a: bigint, n: bigint) {
		const initialResult = a % n;

		// Fix for negative moduli
		if (initialResult < 0) {
			return initialResult + n;
		}

		return initialResult;
	}

	primeFieldInv(a: bigint, n: bigint): bigint {
		const a_mod = this.positiveMod(a, n);

		if (a_mod == BigInt(0)) {
			return BigInt(0);
		}

		let lm = BigInt(1);
		let hm = BigInt(0);

		let low = a_mod % n;
		let high = n;

		while (low > 1) {
			const r = high / low; // Int divide

			const nm = hm - lm * r;
			const newValue = high - low * r;

			hm = lm;
			high = low;
			lm = nm;
			low = newValue;
		}

		const result = this.positiveMod(lm, n);

		return result;
	}

	// Modular arithmetic
	mDiv(left: bigint, right: bigint) {
		return this.positiveMod(left * this.primeFieldInv(right, this.Fp), this.Fp);
	}

	mMul(left: bigint, right: bigint) {
		return this.positiveMod(left * right, this.Fp);
	}

	mAdd(left: bigint, right: bigint) {
		return this.positiveMod(left + right, this.Fp);
	}

	mSub(left: bigint, right: bigint) {
		return this.positiveMod(left - right, this.Fp);
	}

	mPow(left: bigint, right: bigint) {
		if (right == BigInt(0)) {
			return BigInt(1);
		} else if (right == BigInt(1)) {
			return left;
		} else if (right % BigInt(2) == BigInt(0)) {
			return this.positiveMod((left * left) ** (right / BigInt(2)), this.Fp);
		} else {
			return this.positiveMod((left * left) ** (right / BigInt(2)) * left, this.Fp);
		}
	}

	// Point operations
	pDouble(p: ECPoint) {
		const lambda = this.mDiv(
			this.mMul(BigInt(3), this.mPow(p.x, BigInt(2))),
			this.mMul(BigInt(2), p.y)
		);

		const newx = this.mSub(this.mPow(lambda, BigInt(2)), this.mMul(BigInt(2), p.x));
		const newy = this.mSub(this.mAdd(this.mMul(-lambda, newx), this.mMul(lambda, p.x)), p.y);

		return new ECPoint(newx, newy);
	}

	pAdd(p1: ECPoint | undefined, p2: ECPoint | undefined): ECPoint | undefined {
		if (p1 == undefined || p2 == undefined) {
			return p2 == undefined ? p1 : p2;
		}

		if (p1.x == p2.x && p1.y == p2.y) {
			return this.pDouble(p1);
		} else if (p1.x == p2.x) {
			return undefined;
		} else {
			const lambda = this.mDiv(this.mSub(p2.y, p1.y), this.mSub(p2.x, p1.x));
			const x = this.mSub(this.mSub(this.mPow(lambda, BigInt(2)), p1.x), p2.x);
			const y = this.mSub(this.mAdd(this.mMul(-lambda, x), this.mMul(lambda, p1.x)), p1.y);

			return new ECPoint(x, y);
		}
	}

	pMul(p: ECPoint | undefined, n: bigint): ECPoint | undefined {
		if (p == undefined) {
			return undefined;
		}

		if (n == BigInt(0)) {
			return undefined;
		} else if (n == BigInt(1)) {
			return p;
		} else if (n % BigInt(2) == BigInt(0)) {
			return this.pMul(this.pDouble(p), n / BigInt(2));
		} else {
			return this.pAdd(this.pMul(this.pDouble(p), n / BigInt(2)), p);
		}
	}

	private mask(arr: Uint8Array, numBits: number) {
		let idx = 0;
		let b = numBits;
		while (idx < arr.length) {
			arr[idx] = b <= 0 ? 0 : b > 0 && b < 8 ? arr[idx] & ((1 >> b) - 1) : arr[idx];
			++idx;
			b -= 8;
		}
	}

	private getBitCount(v: bigint) {
		let x = v;
		let c = 0;
		do {
			++c;
			x >>= 1n;
		} while (x > 0n);
		return c;
	}

	// Thanks stackoverflow
	private bigRandomInRange(v1: bigint, v2: bigint) {
		const min = v1 > v2 ? v2 : v1;
		const r = v1 - v2;
		const range = r < 0 ? -r : r;
		if (range === 0n) {
			return min;
		}
		const bitCount = this.getBitCount(range);
		const byteCount = Math.ceil(bitCount / 8);
		const arr = new Uint8Array(byteCount);
		for (;;) {
			crypto.getRandomValues(arr);
			this.mask(arr, bitCount);
			const v = arr.reduce((acc, curr, i) => (1n << (BigInt(i) * 8n)) * BigInt(curr) + acc, 0n);
			if (v < range) {
				return min + v;
			}
		}
	}

	public generatePrivateKey() {
		return this.bigRandomInRange(
			BigInt(0),
			BigInt('115792089237316195423570985008687907853269984665640564039457584007913129639936') // 2^256
		);
	}

	public generatePublicKey(privateKey: bigint): ECPoint | undefined {
		return this.pMul(new ECPoint(BigInt(1), BigInt(2)), privateKey);
	}

	private decodeRawPoint(p: ECPoint): bigint {
		return p.x >> BigInt(10);
	}

	public pNeg(p: ECPoint | undefined): ECPoint | undefined {
		if (p == undefined) {
			return undefined;
		} else if (p.x == BigInt(0) && p.y == BigInt(0)) {
			return new ECPoint(BigInt(0), BigInt(0));
		} else {
			return new ECPoint(p.x, this.positiveMod(-p.y, this.Fp));
		}
	}

	public decrypt(privateKey: bigint, message: EncryptedMessage): bigint {
		const decryptedPoint = this.pAdd(message.y, this.pNeg(this.pMul(message.x, privateKey)));

		if (decryptedPoint == undefined) {
			return BigInt(0);
		}

		return this.decodeRawPoint(decryptedPoint);
	}
}
