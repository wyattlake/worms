<script lang="ts">
	import { Curve, ECPoint } from '$lib/crypto';

	const alt_bn128 = new Curve(
		BigInt(0),
		BigInt(3),
		BigInt('21888242871839275222246405745257275088696311157297823662689037894645226208583')
	);

	const gen_point = new ECPoint(BigInt(1), BigInt(2));

	const x = BigInt('238432489239');
	console.log(alt_bn128.pMul(gen_point, x));
</script>
