import { ItemBank } from "../../../types";

export interface Constructable {
    input: ItemBank;
    output: ItemBank;
    xp: number;
    level: number;
}