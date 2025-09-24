import { Items } from 'oldschooljs';
import { afterEach, describe, expect, test, vi } from 'vitest';

import * as degradeableItemsModule from '@/lib/degradeableItems.js';
import { bloodEssence } from '@/lib/skilling/functions/calcsRunecrafting.js';
import * as rngModule from '@/lib/util/rng.js';

type FakeMUser = {
        user: Record<string, number>;
        hasEquipped: ReturnType<typeof vi.fn>;
        gear: {
                skilling: {
                        hasEquipped: ReturnType<typeof vi.fn>;
                };
        };
        update: ReturnType<typeof vi.fn>;
        addItemsToBank: ReturnType<typeof vi.fn>;
        transactItems: ReturnType<typeof vi.fn>;
        owns: ReturnType<typeof vi.fn>;
        usernameOrMention: string;
};

function createTestUser({
        bloodEssenceCharges = 0,
        hasLuckyPenny = false
}: {
        bloodEssenceCharges?: number;
        hasLuckyPenny?: boolean;
} = {}) {
        const base: FakeMUser = {
                user: {
                        blood_essence_charges: bloodEssenceCharges
                },
                hasEquipped: vi.fn((name: string) => hasLuckyPenny && name === "Ghommal's lucky penny"),
                gear: {
                        skilling: {
                                hasEquipped: vi.fn().mockReturnValue(false)
                        }
                },
                update: vi.fn(async (data: Record<string, number>) => {
                        base.user = { ...base.user, ...data };
                        return { newUser: base.user };
                }),
                addItemsToBank: vi.fn().mockResolvedValue(undefined),
                transactItems: vi.fn().mockResolvedValue(undefined),
                owns: vi.fn().mockReturnValue(false),
                usernameOrMention: 'TestUser'
        };
        return base;
}

const { degradeItem, shouldConsumeDegradeableCharge } = degradeableItemsModule;
type TestMUser = Parameters<typeof shouldConsumeDegradeableCharge>[0];

afterEach(() => {
        vi.restoreAllMocks();
});

describe('shouldConsumeDegradeableCharge', () => {
        test('always consumes when the user lacks a lucky penny', () => {
                const user = createTestUser();
                const percentSpy = vi.spyOn(rngModule, 'percentChance');
                expect(shouldConsumeDegradeableCharge(user as unknown as TestMUser)).toBe(true);
                expect(percentSpy).not.toHaveBeenCalled();
        });

        test('refunds a charge when the penny roll succeeds', () => {
                const user = createTestUser({ hasLuckyPenny: true });
                const percentSpy = vi.spyOn(rngModule, 'percentChance').mockReturnValue(true);
                expect(shouldConsumeDegradeableCharge(user as unknown as TestMUser)).toBe(false);
                expect(percentSpy).toHaveBeenCalledWith(5);
        });

        test('consumes a charge when the penny roll fails', () => {
                const user = createTestUser({ hasLuckyPenny: true });
                const percentSpy = vi.spyOn(rngModule, 'percentChance').mockReturnValue(false);
                expect(shouldConsumeDegradeableCharge(user as unknown as TestMUser)).toBe(true);
                expect(percentSpy).toHaveBeenCalledWith(5);
        });
});

describe('degradeItem', () => {
        test('skips lucky penny rolls when requested', async () => {
                const user = createTestUser({ bloodEssenceCharges: 10 });
                const item = Items.getOrThrow('Blood essence (active)');
                const result = await degradeItem({
                        item,
                        chargesToDegrade: 3,
                        user: user as unknown as TestMUser,
                        applyLuckyPenny: false
                });
                expect(user.update).toHaveBeenCalledWith({ blood_essence_charges: 7 });
                expect(user.user.blood_essence_charges).toBe(7);
                expect(result).toStrictEqual({
                        chargesToDegrade: 3,
                        userMessage: `Your ${item.name} degraded by 3 charges`
                });
        });

        test('applies lucky penny rolls charge by charge', async () => {
                const user = createTestUser({ bloodEssenceCharges: 10, hasLuckyPenny: true });
                const item = Items.getOrThrow('Blood essence (active)');
                const percentSpy = vi
                        .spyOn(rngModule, 'percentChance')
                        .mockImplementationOnce(() => true)
                        .mockImplementationOnce(() => false)
                        .mockImplementationOnce(() => false)
                        .mockImplementationOnce(() => true);
                const result = await degradeItem({
                        item,
                        chargesToDegrade: 4,
                        user: user as unknown as TestMUser
                });
                expect(percentSpy).toHaveBeenCalledTimes(4);
                for (let i = 1; i <= 4; i++) {
                        expect(percentSpy).toHaveBeenNthCalledWith(i, 5);
                }
                expect(user.update).toHaveBeenCalledWith({ blood_essence_charges: 8 });
                expect(user.user.blood_essence_charges).toBe(8);
                expect(result).toStrictEqual({
                        chargesToDegrade: 2,
                        userMessage: `Your ${item.name} degraded by 2 charges`
                });
        });
});

describe('bloodEssence', () => {
        test('honors mid-trip lucky penny refunds', async () => {
                const user = createTestUser({ bloodEssenceCharges: 4, hasLuckyPenny: true });
                const percentSpy = vi
                        .spyOn(rngModule, 'percentChance')
                        .mockImplementationOnce(() => true)
                        .mockImplementationOnce(() => true)
                        .mockImplementationOnce(() => false)
                        .mockImplementationOnce(() => true)
                        .mockImplementationOnce(() => true);
                const shouldConsumeSpy = vi
                        .spyOn(degradeableItemsModule, 'shouldConsumeDegradeableCharge')
                        .mockImplementationOnce(() => true)
                        .mockImplementationOnce(() => false)
                        .mockImplementationOnce(() => true)
                        .mockImplementationOnce(() => true);
                const degradeItemSpy = vi.spyOn(degradeableItemsModule, 'degradeItem');

                const bonus = await bloodEssence(user as unknown as TestMUser, 5);

                expect(percentSpy).toHaveBeenCalledTimes(5);
                expect(shouldConsumeSpy).toHaveBeenCalledTimes(4);
                expect(bonus).toBe(4);
                expect(degradeItemSpy).toHaveBeenCalledTimes(1);
                const degradeCall = degradeItemSpy.mock.calls[0][0];
                expect(degradeCall.chargesToDegrade).toBe(3);
                expect(degradeCall.applyLuckyPenny).toBe(false);
                expect(degradeCall.user).toBe(user);
                expect(degradeCall.item.name).toBe('Blood essence (active)');
                expect(user.user.blood_essence_charges).toBe(1);
        });

        test('skips degrading when every proc is refunded', async () => {
                const user = createTestUser({ bloodEssenceCharges: 3, hasLuckyPenny: true });
                const percentSpy = vi
                        .spyOn(rngModule, 'percentChance')
                        .mockImplementationOnce(() => true)
                        .mockImplementationOnce(() => true)
                        .mockImplementationOnce(() => true);
                vi.spyOn(degradeableItemsModule, 'shouldConsumeDegradeableCharge').mockReturnValue(false);
                const degradeItemSpy = vi.spyOn(degradeableItemsModule, 'degradeItem');

                const bonus = await bloodEssence(user as unknown as TestMUser, 3);

                expect(percentSpy).toHaveBeenCalledTimes(3);
                expect(bonus).toBe(3);
                expect(degradeItemSpy).not.toHaveBeenCalled();
                expect(user.user.blood_essence_charges).toBe(3);
        });
});
