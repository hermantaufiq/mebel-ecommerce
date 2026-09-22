import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user;
	let defaultAddress = null;

	if (user) {
		defaultAddress = await prisma.address.findFirst({
			where: { userId: user.id, isDefault: true }
		});
		if (!defaultAddress) {
			defaultAddress = await prisma.address.findFirst({
				where: { userId: user.id }
			});
		}
	}

	return {
		user,
		defaultAddress
	};
};
