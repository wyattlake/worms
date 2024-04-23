export class ECPoint {
	constructor(
		public x: bigint,
		public y: bigint
	) {}
}

export class Curve {
	constructor(
		public A: bigint,
		public B: bigint,
		public Fp: bigint
	) {}

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
}
