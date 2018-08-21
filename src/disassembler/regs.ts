import * as assert from 'assert';


/// Enumeration of the Z80 registers.
export enum REGISTER {
	A = 0,
	F, B, C, D, E, H, L,
	A2,
	F2, B2, C2, D2, E2, H2, L2,
	IXL, IXH, IYL, IYH,
	REGS_MAX	// count of registers
};

/**
 * The Regs class is used to represent the status of the registers.
 * Mainly: used/unused.
 * A Regs instance can be merged with another. This class
 * offers the required functionality.
 */
export class Regs {
	/// The register representation.
	public regs = new Array<REGISTER>(REGISTER.REGS_MAX);

	/// The associated names of the registers.
	protected static names = [
		'A', 'F', 'B', 'C', 'D', 'E', 'H', 'L',
		"A'", "F'", "B'", "C'", "D'", "E'", "H'", "L'",
		'IXL', 'IXH', 'IYL', 'IYH'
	];

	/// Holds all opcode addresses used so far (in the subroutine).
	public usedAddresses: Array<number> = [];

	/// Collects the input registers found so far.
	public inputRegs = new Set<REGISTER>();

	/// The stack (push, call).
	public stack: Array<number> = []; // TODO: type unclear


	/**
	 * Initialize registers to "unused".
	 */
	constructor() {
		// Assign register to themselves (unused).
		for(let r=0; r<REGISTER.REGS_MAX; r++) {
			this.regs[r] = r;
		}
		assert(Regs.names.length == REGISTER.REGS_MAX);
	}


	/**
	 * Test if register has been used.
	 * @param r The register to test.
	 * @returns true if the register is used.
	 */
	public isUsed(r: REGISTER): boolean {
		return (this.regs[r] != r);
	}

	/**
	 * Mark the register as being used.
	 * @param r The register to use. (gets -1).
	 */
	public use(r: REGISTER) {
		this.regs[r] = -1;
	}


	/**
	 * Exchanges AF and A2F2.
	 */
	public exxAF() {
		const a = this.regs[REGISTER.A];
		const f = this.regs[REGISTER.F];
		this.regs[REGISTER.A]= this.regs[REGISTER.A2];
		this.regs[REGISTER.F]= this.regs[REGISTER.F2];
		this.regs[REGISTER.A2]= a;
		this.regs[REGISTER.F2]= f;
	}

    /**
	 * Exchanges: BC with B2C2, DE with D2E2 and HL with H2L2.
	 */
    public exx() {
		const diff = REGISTER.B2 - REGISTER.B;
		for(let r=REGISTER.B; r<=REGISTER.L; r++) {
			const tmp = this.regs[r];
			this.regs[r] = this.regs[r+diff];
			this.regs[r+diff] = tmp;
		}
	}

	// TODO: EX DE,HL, EX (SP),HL etc.

	/**
	 * Returns the name of the register.
	 * @param r The register as number, e.g. H2
	 * @return the register as name, e.g. "H'"
	 */
	public getRegName(r: REGISTER): string {
		return Regs.names[r];
	}


	/**
	 * Returns all used registers as a set.
	 */
	public usedRegs(): Set<REGISTER> {
		const usedRegs = new Set<REGISTER>();
		for(let r=0; r<REGISTER.REGS_MAX; r++) {
			if(this.regs[r] != r)
				usedRegs.add(r);
		}
		return usedRegs;
	}


	/**
	 * Clones the instance completely with usedAddresses,
	 * inputRegs and stack.
	 * @returns A new instance.
	 */
	public clone(): Regs {
		const nRegs = new Regs();
		// Copy registers
		for(let r=0; r<REGISTER.REGS_MAX; r++) {
			nRegs.regs[r] = this.regs[r];
		}
		// Copy usedAddresses
		for(const addr of this.usedAddresses)
			nRegs.usedAddresses.push(addr);
		// Copy inputRegs
		for(const reg of this.inputRegs)
			nRegs.inputRegs.add(reg);
		// Copy stack
		for(const val of this.stack)
			nRegs.stack.push(val);
		// Return
		return nRegs;
	}


	/**
	 * Merges 2 register instances.
	 * Each used register of the otherRegs is copied here.
	 * @param otherRegs Other instance that is merged.
	 */
	public merge(otherRegs: Regs) {
		for(let r=0; r<REGISTER.REGS_MAX; r++) {
			if(otherRegs.regs[r] != r)
				this.regs[r] = otherRegs.regs[r];
		}
	}
}