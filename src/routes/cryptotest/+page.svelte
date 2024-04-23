<script lang="ts">
	import { Curve, ECPoint, EncryptedMessage } from '$lib/crypto';

	const ecc = Curve.alt_bn128();

	// const privateKey = ecc.generatePrivateKey();
	const privateKey = BigInt(12);
	// const publicKey = ecc.generatePublicKey(privateKey);

	console.log(
		ecc.decrypt(
			privateKey,
			new EncryptedMessage(
				new ECPoint(
					BigInt('6880448689389350391313156031345092332727233274631084306710044265222472228983'),
					BigInt('14628804599421596126450424756703084123588574405738088923158300616205465232619')
				),
				new ECPoint(
					BigInt('20315032863293399502308717084041282382392882649452966993642829822642984509024'),
					BigInt('5908621500160417034324881136872653040519357755556178648959151499352524029854')
				)
			)
		)
	);
</script>
