const minutesInHour = 60;
const targetHours = 135;
const totalChances = targetHours * minutesInHour;

export const eggChancePerMinute = 5;

const eggsIn250Hours = totalChances / eggChancePerMinute;

export const chickenChanceFromEgg = eggsIn250Hours;
