import { i as __toDynamicImportESM } from "./chunk-CJnywcLQ.js";
import { Fragment, Text, computed, createVNode, defineComponent, effectScope, getCurrentInstance, h, inject, isRef, onMounted, onUnmounted, ref, shallowRef, watch } from "vue";
import { Modal, message } from "ant-design-vue";
import dayjs from "dayjs";
import { cloneDeep, find, flatMapDeep, isArray, isBoolean, isFunction, isNull, isObject, isString, isUndefined, reduce } from "lodash-es";
import axios from "axios";
const crypto = typeof globalThis == "object" && "crypto" in globalThis ? globalThis.crypto : void 0;
function isBytes$1(e) {
	return e instanceof Uint8Array || ArrayBuffer.isView(e) && e.constructor.name === "Uint8Array";
}
function anumber(e) {
	if (!Number.isSafeInteger(e) || e < 0) throw Error("positive integer expected, got " + e);
}
function abytes$1(e, ...t) {
	if (!isBytes$1(e)) throw Error("Uint8Array expected");
	if (t.length > 0 && !t.includes(e.length)) throw Error("Uint8Array expected of length " + t + ", got length=" + e.length);
}
function ahash(e) {
	if (typeof e != "function" || typeof e.create != "function") throw Error("Hash should be wrapped by utils.createHasher");
	anumber(e.outputLen), anumber(e.blockLen);
}
function aexists$1(e, t = !0) {
	if (e.destroyed) throw Error("Hash instance has been destroyed");
	if (t && e.finished) throw Error("Hash#digest() has already been called");
}
function clean$1(...e) {
	for (let t = 0; t < e.length; t++) e[t].fill(0);
}
var hasHexBuiltin = /* @__PURE__ */ (() => typeof Uint8Array.from([]).toHex == "function" && typeof Uint8Array.fromHex == "function")(), hexes$1 = /* @__PURE__ */ Array.from({ length: 256 }, (e, t) => t.toString(16).padStart(2, "0"));
function bytesToHex$1(e) {
	if (abytes$1(e), hasHexBuiltin) return e.toHex();
	let t = "";
	for (let n = 0; n < e.length; n++) t += hexes$1[e[n]];
	return t;
}
var asciis = {
	_0: 48,
	_9: 57,
	A: 65,
	F: 70,
	a: 97,
	f: 102
};
function asciiToBase16(e) {
	if (e >= asciis._0 && e <= asciis._9) return e - asciis._0;
	if (e >= asciis.A && e <= asciis.F) return e - (asciis.A - 10);
	if (e >= asciis.a && e <= asciis.f) return e - (asciis.a - 10);
}
function hexToBytes(e) {
	if (typeof e != "string") throw Error("hex string expected, got " + typeof e);
	if (hasHexBuiltin) return Uint8Array.fromHex(e);
	let t = e.length, n = t / 2;
	if (t % 2) throw Error("hex string expected, got unpadded hex of length " + t);
	let r = new Uint8Array(n);
	for (let t = 0, i = 0; t < n; t++, i += 2) {
		let n = asciiToBase16(e.charCodeAt(i)), a = asciiToBase16(e.charCodeAt(i + 1));
		if (n === void 0 || a === void 0) {
			let t = e[i] + e[i + 1];
			throw Error("hex string expected, got non-hex character \"" + t + "\" at index " + i);
		}
		r[t] = n * 16 + a;
	}
	return r;
}
function utf8ToBytes$3(e) {
	if (typeof e != "string") throw Error("string expected");
	return new Uint8Array(new TextEncoder().encode(e));
}
function toBytes$2(e) {
	return typeof e == "string" && (e = utf8ToBytes$3(e)), abytes$1(e), e;
}
function concatBytes$1(...e) {
	let t = 0;
	for (let n = 0; n < e.length; n++) {
		let r = e[n];
		abytes$1(r), t += r.length;
	}
	let n = new Uint8Array(t);
	for (let t = 0, r = 0; t < e.length; t++) {
		let i = e[t];
		n.set(i, r), r += i.length;
	}
	return n;
}
var Hash$2 = class {};
function randomBytes$1(e = 32) {
	if (crypto && typeof crypto.getRandomValues == "function") return crypto.getRandomValues(new Uint8Array(e));
	if (crypto && typeof crypto.randomBytes == "function") return Uint8Array.from(crypto.randomBytes(e));
	throw Error("crypto.getRandomValues must be defined");
}
var _0n$3 = /* @__PURE__ */ BigInt(0), _1n$3 = /* @__PURE__ */ BigInt(1);
function _abool2(e, t = "") {
	if (typeof e != "boolean") {
		let n = t && `"${t}"`;
		throw Error(n + "expected boolean, got type=" + typeof e);
	}
	return e;
}
function _abytes2(e, t, n = "") {
	let r = isBytes$1(e), i = e?.length, a = t !== void 0;
	if (!r || a && i !== t) {
		let o = n && `"${n}" `, s = a ? ` of length ${t}` : "", c = r ? `length=${i}` : `type=${typeof e}`;
		throw Error(o + "expected Uint8Array" + s + ", got " + c);
	}
	return e;
}
function numberToHexUnpadded(e) {
	let t = e.toString(16);
	return t.length & 1 ? "0" + t : t;
}
function hexToNumber$1(e) {
	if (typeof e != "string") throw Error("hex string expected, got " + typeof e);
	return e === "" ? _0n$3 : BigInt("0x" + e);
}
function bytesToNumberBE(e) {
	return hexToNumber$1(bytesToHex$1(e));
}
function bytesToNumberLE(e) {
	return abytes$1(e), hexToNumber$1(bytesToHex$1(Uint8Array.from(e).reverse()));
}
function numberToBytesBE(e, t) {
	return hexToBytes(e.toString(16).padStart(t * 2, "0"));
}
function numberToBytesLE(e, t) {
	return numberToBytesBE(e, t).reverse();
}
function ensureBytes(e, t, n) {
	let r;
	if (typeof t == "string") try {
		r = hexToBytes(t);
	} catch (t) {
		throw Error(e + " must be hex string or Uint8Array, cause: " + t);
	}
	else if (isBytes$1(t)) r = Uint8Array.from(t);
	else throw Error(e + " must be hex string or Uint8Array");
	let i = r.length;
	if (typeof n == "number" && i !== n) throw Error(e + " of length " + n + " expected, got " + i);
	return r;
}
var isPosBig = (e) => typeof e == "bigint" && _0n$3 <= e;
function inRange(e, t, n) {
	return isPosBig(e) && isPosBig(t) && isPosBig(n) && t <= e && e < n;
}
function aInRange(e, t, n, r) {
	if (!inRange(t, n, r)) throw Error("expected valid " + e + ": " + n + " <= n < " + r + ", got " + t);
}
function bitLen(e) {
	let t;
	for (t = 0; e > _0n$3; e >>= _1n$3, t += 1);
	return t;
}
const bitMask = (e) => (_1n$3 << BigInt(e)) - _1n$3;
function createHmacDrbg(e, t, n) {
	if (typeof e != "number" || e < 2) throw Error("hashLen must be a number");
	if (typeof t != "number" || t < 2) throw Error("qByteLen must be a number");
	if (typeof n != "function") throw Error("hmacFn must be a function");
	let r = (e) => new Uint8Array(e), i = (e) => Uint8Array.of(e), a = r(e), o = r(e), s = 0, c = () => {
		a.fill(1), o.fill(0), s = 0;
	}, l = (...e) => n(o, a, ...e), u = (e = r(0)) => {
		o = l(i(0), e), a = l(), e.length !== 0 && (o = l(i(1), e), a = l());
	}, d = () => {
		if (s++ >= 1e3) throw Error("drbg: tried 1000 values");
		let e = 0, n = [];
		for (; e < t;) {
			a = l();
			let t = a.slice();
			n.push(t), e += a.length;
		}
		return concatBytes$1(...n);
	};
	return (e, t) => {
		c(), u(e);
		let n;
		for (; !(n = t(d()));) u();
		return c(), n;
	};
}
function _validateObject(e, t, n = {}) {
	if (!e || typeof e != "object") throw Error("expected valid options object");
	function r(t, n, r) {
		let i = e[t];
		if (r && i === void 0) return;
		let a = typeof i;
		if (a !== n || i === null) throw Error(`param "${t}" is invalid: expected ${n}, got ${a}`);
	}
	Object.entries(t).forEach(([e, t]) => r(e, t, !1)), Object.entries(n).forEach(([e, t]) => r(e, t, !0));
}
function memoized(e) {
	let t = /* @__PURE__ */ new WeakMap();
	return (n, ...r) => {
		let i = t.get(n);
		if (i !== void 0) return i;
		let a = e(n, ...r);
		return t.set(n, a), a;
	};
}
const bytesToHex$2 = bytesToHex$1, concatBytes = concatBytes$1, utf8ToBytes$2 = utf8ToBytes$3, numberToHexUnpadded$1 = numberToHexUnpadded, hexToNumber = hexToNumber$1, numberToBytesBE$1 = numberToBytesBE;
var HMAC$1 = class extends Hash$2 {
	constructor(e, t) {
		super(), this.finished = !1, this.destroyed = !1, ahash(e);
		let n = toBytes$2(t);
		if (this.iHash = e.create(), typeof this.iHash.update != "function") throw Error("Expected instance of class which extends utils.Hash");
		this.blockLen = this.iHash.blockLen, this.outputLen = this.iHash.outputLen;
		let r = this.blockLen, i = new Uint8Array(r);
		i.set(n.length > r ? e.create().update(n).digest() : n);
		for (let e = 0; e < i.length; e++) i[e] ^= 54;
		this.iHash.update(i), this.oHash = e.create();
		for (let e = 0; e < i.length; e++) i[e] ^= 106;
		this.oHash.update(i), clean$1(i);
	}
	update(e) {
		return aexists$1(this), this.iHash.update(e), this;
	}
	digestInto(e) {
		aexists$1(this), abytes$1(e, this.outputLen), this.finished = !0, this.iHash.digestInto(e), this.oHash.update(e), this.oHash.digestInto(e), this.destroy();
	}
	digest() {
		let e = new Uint8Array(this.oHash.outputLen);
		return this.digestInto(e), e;
	}
	_cloneInto(e) {
		e ||= Object.create(Object.getPrototypeOf(this), {});
		let { oHash: t, iHash: n, finished: r, destroyed: i, blockLen: a, outputLen: o } = this;
		return e = e, e.finished = r, e.destroyed = i, e.blockLen = a, e.outputLen = o, e.oHash = t._cloneInto(e.oHash), e.iHash = n._cloneInto(e.iHash), e;
	}
	clone() {
		return this._cloneInto();
	}
	destroy() {
		this.destroyed = !0, this.oHash.destroy(), this.iHash.destroy();
	}
};
const hmac$1 = (e, t, n) => new HMAC$1(e, t).update(n).digest();
hmac$1.create = (e, t) => new HMAC$1(e, t);
var _0n$2 = BigInt(0), _1n$2 = BigInt(1), _2n$1 = /* @__PURE__ */ BigInt(2), _3n$1 = /* @__PURE__ */ BigInt(3), _4n$1 = /* @__PURE__ */ BigInt(4), _5n = /* @__PURE__ */ BigInt(5), _7n = /* @__PURE__ */ BigInt(7), _8n = /* @__PURE__ */ BigInt(8), _9n = /* @__PURE__ */ BigInt(9), _16n = /* @__PURE__ */ BigInt(16);
function mod(e, t) {
	let n = e % t;
	return n >= _0n$2 ? n : t + n;
}
function invert(e, t) {
	if (e === _0n$2) throw Error("invert: expected non-zero number");
	if (t <= _0n$2) throw Error("invert: expected positive modulus, got " + t);
	let n = mod(e, t), r = t, i = _0n$2, a = _1n$2, o = _1n$2, s = _0n$2;
	for (; n !== _0n$2;) {
		let e = r / n, t = r % n, c = i - o * e, l = a - s * e;
		r = n, n = t, i = o, a = s, o = c, s = l;
	}
	if (r !== _1n$2) throw Error("invert: does not exist");
	return mod(i, t);
}
function assertIsSquare(e, t, n) {
	if (!e.eql(e.sqr(t), n)) throw Error("Cannot find square root");
}
function sqrt3mod4(e, t) {
	let n = (e.ORDER + _1n$2) / _4n$1, r = e.pow(t, n);
	return assertIsSquare(e, r, t), r;
}
function sqrt5mod8(e, t) {
	let n = (e.ORDER - _5n) / _8n, r = e.mul(t, _2n$1), i = e.pow(r, n), a = e.mul(t, i), o = e.mul(e.mul(a, _2n$1), i), s = e.mul(a, e.sub(o, e.ONE));
	return assertIsSquare(e, s, t), s;
}
function sqrt9mod16(e) {
	let t = Field(e), n = tonelliShanks(e), r = n(t, t.neg(t.ONE)), i = n(t, r), a = n(t, t.neg(r)), o = (e + _7n) / _16n;
	return (e, t) => {
		let n = e.pow(t, o), s = e.mul(n, r), c = e.mul(n, i), l = e.mul(n, a), u = e.eql(e.sqr(s), t), d = e.eql(e.sqr(c), t);
		n = e.cmov(n, s, u), s = e.cmov(l, c, d);
		let f = e.eql(e.sqr(s), t), p = e.cmov(n, s, f);
		return assertIsSquare(e, p, t), p;
	};
}
function tonelliShanks(e) {
	if (e < _3n$1) throw Error("sqrt is not defined for small field");
	let t = e - _1n$2, n = 0;
	for (; t % _2n$1 === _0n$2;) t /= _2n$1, n++;
	let r = _2n$1, i = Field(e);
	for (; FpLegendre(i, r) === 1;) if (r++ > 1e3) throw Error("Cannot find square root: probably non-prime P");
	if (n === 1) return sqrt3mod4;
	let a = i.pow(r, t), o = (t + _1n$2) / _2n$1;
	return function(e, r) {
		if (e.is0(r)) return r;
		if (FpLegendre(e, r) !== 1) throw Error("Cannot find square root");
		let i = n, s = e.mul(e.ONE, a), c = e.pow(r, t), l = e.pow(r, o);
		for (; !e.eql(c, e.ONE);) {
			if (e.is0(c)) return e.ZERO;
			let t = 1, n = e.sqr(c);
			for (; !e.eql(n, e.ONE);) if (t++, n = e.sqr(n), t === i) throw Error("Cannot find square root");
			let r = _1n$2 << BigInt(i - t - 1), a = e.pow(s, r);
			i = t, s = e.sqr(a), c = e.mul(c, s), l = e.mul(l, a);
		}
		return l;
	};
}
function FpSqrt(e) {
	return e % _4n$1 === _3n$1 ? sqrt3mod4 : e % _8n === _5n ? sqrt5mod8 : e % _16n === _9n ? sqrt9mod16(e) : tonelliShanks(e);
}
var FIELD_FIELDS = [
	"create",
	"isValid",
	"is0",
	"neg",
	"inv",
	"sqrt",
	"sqr",
	"eql",
	"add",
	"sub",
	"mul",
	"pow",
	"div",
	"addN",
	"subN",
	"mulN",
	"sqrN"
];
function validateField(e) {
	return _validateObject(e, FIELD_FIELDS.reduce((e, t) => (e[t] = "function", e), {
		ORDER: "bigint",
		MASK: "bigint",
		BYTES: "number",
		BITS: "number"
	})), e;
}
function FpPow(e, t, n) {
	if (n < _0n$2) throw Error("invalid exponent, negatives unsupported");
	if (n === _0n$2) return e.ONE;
	if (n === _1n$2) return t;
	let r = e.ONE, i = t;
	for (; n > _0n$2;) n & _1n$2 && (r = e.mul(r, i)), i = e.sqr(i), n >>= _1n$2;
	return r;
}
function FpInvertBatch(e, t, n = !1) {
	let r = Array(t.length).fill(n ? e.ZERO : void 0), i = t.reduce((t, n, i) => e.is0(n) ? t : (r[i] = t, e.mul(t, n)), e.ONE), a = e.inv(i);
	return t.reduceRight((t, n, i) => e.is0(n) ? t : (r[i] = e.mul(t, r[i]), e.mul(t, n)), a), r;
}
function FpLegendre(e, t) {
	let n = (e.ORDER - _1n$2) / _2n$1, r = e.pow(t, n), i = e.eql(r, e.ONE), a = e.eql(r, e.ZERO), o = e.eql(r, e.neg(e.ONE));
	if (!i && !a && !o) throw Error("invalid Legendre symbol result");
	return i ? 1 : a ? 0 : -1;
}
function nLength(e, t) {
	t !== void 0 && anumber(t);
	let n = t === void 0 ? e.toString(2).length : t;
	return {
		nBitLength: n,
		nByteLength: Math.ceil(n / 8)
	};
}
function Field(e, t, n = !1, r = {}) {
	if (e <= _0n$2) throw Error("invalid field: expected ORDER > 0, got " + e);
	let i, a, o = !1, s;
	if (typeof t == "object" && t) {
		if (r.sqrt || n) throw Error("cannot specify opts in two arguments");
		let e = t;
		e.BITS && (i = e.BITS), e.sqrt && (a = e.sqrt), typeof e.isLE == "boolean" && (n = e.isLE), typeof e.modFromBytes == "boolean" && (o = e.modFromBytes), s = e.allowedLengths;
	} else typeof t == "number" && (i = t), r.sqrt && (a = r.sqrt);
	let { nBitLength: c, nByteLength: l } = nLength(e, i);
	if (l > 2048) throw Error("invalid field: expected ORDER of <= 2048 bytes");
	let u, d = Object.freeze({
		ORDER: e,
		isLE: n,
		BITS: c,
		BYTES: l,
		MASK: bitMask(c),
		ZERO: _0n$2,
		ONE: _1n$2,
		allowedLengths: s,
		create: (t) => mod(t, e),
		isValid: (t) => {
			if (typeof t != "bigint") throw Error("invalid field element: expected bigint, got " + typeof t);
			return _0n$2 <= t && t < e;
		},
		is0: (e) => e === _0n$2,
		isValidNot0: (e) => !d.is0(e) && d.isValid(e),
		isOdd: (e) => (e & _1n$2) === _1n$2,
		neg: (t) => mod(-t, e),
		eql: (e, t) => e === t,
		sqr: (t) => mod(t * t, e),
		add: (t, n) => mod(t + n, e),
		sub: (t, n) => mod(t - n, e),
		mul: (t, n) => mod(t * n, e),
		pow: (e, t) => FpPow(d, e, t),
		div: (t, n) => mod(t * invert(n, e), e),
		sqrN: (e) => e * e,
		addN: (e, t) => e + t,
		subN: (e, t) => e - t,
		mulN: (e, t) => e * t,
		inv: (t) => invert(t, e),
		sqrt: a || ((t) => (u ||= FpSqrt(e), u(d, t))),
		toBytes: (e) => n ? numberToBytesLE(e, l) : numberToBytesBE(e, l),
		fromBytes: (t, r = !0) => {
			if (s) {
				if (!s.includes(t.length) || t.length > l) throw Error("Field.fromBytes: expected " + s + " bytes, got " + t.length);
				let e = new Uint8Array(l);
				e.set(t, n ? 0 : e.length - t.length), t = e;
			}
			if (t.length !== l) throw Error("Field.fromBytes: expected " + l + " bytes, got " + t.length);
			let i = n ? bytesToNumberLE(t) : bytesToNumberBE(t);
			if (o && (i = mod(i, e)), !r && !d.isValid(i)) throw Error("invalid field element: outside of range 0..ORDER");
			return i;
		},
		invertBatch: (e) => FpInvertBatch(d, e),
		cmov: (e, t, n) => n ? t : e
	});
	return Object.freeze(d);
}
function getFieldBytesLength(e) {
	if (typeof e != "bigint") throw Error("field order must be bigint");
	let t = e.toString(2).length;
	return Math.ceil(t / 8);
}
function getMinHashLength(e) {
	let t = getFieldBytesLength(e);
	return t + Math.ceil(t / 2);
}
function mapHashToField(e, t, n = !1) {
	let r = e.length, i = getFieldBytesLength(t), a = getMinHashLength(t);
	if (r < 16 || r < a || r > 1024) throw Error("expected " + a + "-1024 bytes of input, got " + r);
	let o = mod(n ? bytesToNumberLE(e) : bytesToNumberBE(e), t - _1n$2) + _1n$2;
	return n ? numberToBytesLE(o, i) : numberToBytesBE(o, i);
}
var _0n$1 = BigInt(0), _1n$1 = BigInt(1);
function negateCt(e, t) {
	let n = t.negate();
	return e ? n : t;
}
function normalizeZ(e, t) {
	let n = FpInvertBatch(e.Fp, t.map((e) => e.Z));
	return t.map((t, r) => e.fromAffine(t.toAffine(n[r])));
}
function validateW(e, t) {
	if (!Number.isSafeInteger(e) || e <= 0 || e > t) throw Error("invalid window size, expected [1.." + t + "], got W=" + e);
}
function calcWOpts(e, t) {
	validateW(e, t);
	let n = Math.ceil(t / e) + 1, r = 2 ** (e - 1), i = 2 ** e;
	return {
		windows: n,
		windowSize: r,
		mask: bitMask(e),
		maxNumber: i,
		shiftBy: BigInt(e)
	};
}
function calcOffsets(e, t, n) {
	let { windowSize: r, mask: i, maxNumber: a, shiftBy: o } = n, s = Number(e & i), c = e >> o;
	s > r && (s -= a, c += _1n$1);
	let l = t * r, u = l + Math.abs(s) - 1, d = s === 0, f = s < 0, p = t % 2 != 0;
	return {
		nextN: c,
		offset: u,
		isZero: d,
		isNeg: f,
		isNegF: p,
		offsetF: l
	};
}
function validateMSMPoints(e, t) {
	if (!Array.isArray(e)) throw Error("array expected");
	e.forEach((e, n) => {
		if (!(e instanceof t)) throw Error("invalid point at index " + n);
	});
}
function validateMSMScalars(e, t) {
	if (!Array.isArray(e)) throw Error("array of scalars expected");
	e.forEach((e, n) => {
		if (!t.isValid(e)) throw Error("invalid scalar at index " + n);
	});
}
var pointPrecomputes = /* @__PURE__ */ new WeakMap(), pointWindowSizes = /* @__PURE__ */ new WeakMap();
function getW(e) {
	return pointWindowSizes.get(e) || 1;
}
function assert0(e) {
	if (e !== _0n$1) throw Error("invalid wNAF");
}
var wNAF = class {
	constructor(e, t) {
		this.BASE = e.BASE, this.ZERO = e.ZERO, this.Fn = e.Fn, this.bits = t;
	}
	_unsafeLadder(e, t, n = this.ZERO) {
		let r = e;
		for (; t > _0n$1;) t & _1n$1 && (n = n.add(r)), r = r.double(), t >>= _1n$1;
		return n;
	}
	precomputeWindow(e, t) {
		let { windows: n, windowSize: r } = calcWOpts(t, this.bits), i = [], a = e, o = a;
		for (let e = 0; e < n; e++) {
			o = a, i.push(o);
			for (let e = 1; e < r; e++) o = o.add(a), i.push(o);
			a = o.double();
		}
		return i;
	}
	wNAF(e, t, n) {
		if (!this.Fn.isValid(n)) throw Error("invalid scalar");
		let r = this.ZERO, i = this.BASE, a = calcWOpts(e, this.bits);
		for (let e = 0; e < a.windows; e++) {
			let { nextN: o, offset: s, isZero: c, isNeg: l, isNegF: u, offsetF: d } = calcOffsets(n, e, a);
			n = o, c ? i = i.add(negateCt(u, t[d])) : r = r.add(negateCt(l, t[s]));
		}
		return assert0(n), {
			p: r,
			f: i
		};
	}
	wNAFUnsafe(e, t, n, r = this.ZERO) {
		let i = calcWOpts(e, this.bits);
		for (let e = 0; e < i.windows && n !== _0n$1; e++) {
			let { nextN: a, offset: o, isZero: s, isNeg: c } = calcOffsets(n, e, i);
			if (n = a, !s) {
				let e = t[o];
				r = r.add(c ? e.negate() : e);
			}
		}
		return assert0(n), r;
	}
	getPrecomputes(e, t, n) {
		let r = pointPrecomputes.get(t);
		return r || (r = this.precomputeWindow(t, e), e !== 1 && (typeof n == "function" && (r = n(r)), pointPrecomputes.set(t, r))), r;
	}
	cached(e, t, n) {
		let r = getW(e);
		return this.wNAF(r, this.getPrecomputes(r, e, n), t);
	}
	unsafe(e, t, n, r) {
		let i = getW(e);
		return i === 1 ? this._unsafeLadder(e, t, r) : this.wNAFUnsafe(i, this.getPrecomputes(i, e, n), t, r);
	}
	createCache(e, t) {
		validateW(t, this.bits), pointWindowSizes.set(e, t), pointPrecomputes.delete(e);
	}
	hasCache(e) {
		return getW(e) !== 1;
	}
};
function mulEndoUnsafe(e, t, n, r) {
	let i = t, a = e.ZERO, o = e.ZERO;
	for (; n > _0n$1 || r > _0n$1;) n & _1n$1 && (a = a.add(i)), r & _1n$1 && (o = o.add(i)), i = i.double(), n >>= _1n$1, r >>= _1n$1;
	return {
		p1: a,
		p2: o
	};
}
function pippenger(e, t, n, r) {
	validateMSMPoints(n, e), validateMSMScalars(r, t);
	let i = n.length, a = r.length;
	if (i !== a) throw Error("arrays of points and scalars must have equal length");
	let o = e.ZERO, s = bitLen(BigInt(i)), c = 1;
	s > 12 ? c = s - 3 : s > 4 ? c = s - 2 : s > 0 && (c = 2);
	let l = bitMask(c), u = Array(Number(l) + 1).fill(o), d = Math.floor((t.BITS - 1) / c) * c, f = o;
	for (let e = d; e >= 0; e -= c) {
		u.fill(o);
		for (let t = 0; t < a; t++) {
			let i = r[t], a = Number(i >> BigInt(e) & l);
			u[a] = u[a].add(n[t]);
		}
		let t = o;
		for (let e = u.length - 1, n = o; e > 0; e--) n = n.add(u[e]), t = t.add(n);
		if (f = f.add(t), e !== 0) for (let e = 0; e < c; e++) f = f.double();
	}
	return f;
}
function createField(e, t, n) {
	if (t) {
		if (t.ORDER !== e) throw Error("Field.ORDER must match order: Fp == p, Fn == n");
		return validateField(t), t;
	} else return Field(e, { isLE: n });
}
function _createCurveFields(e, t, n = {}, r) {
	if (r === void 0 && (r = e === "edwards"), !t || typeof t != "object") throw Error(`expected valid ${e} CURVE object`);
	for (let e of [
		"p",
		"n",
		"h"
	]) {
		let n = t[e];
		if (!(typeof n == "bigint" && n > _0n$1)) throw Error(`CURVE.${e} must be positive bigint`);
	}
	let i = createField(t.p, n.Fp, r), a = createField(t.n, n.Fn, r), o = [
		"Gx",
		"Gy",
		"a",
		e === "weierstrass" ? "b" : "d"
	];
	for (let e of o) if (!i.isValid(t[e])) throw Error(`CURVE.${e} must be valid field element of CURVE.Fp`);
	return t = Object.freeze(Object.assign({}, t)), {
		CURVE: t,
		Fp: i,
		Fn: a
	};
}
var divNearest = (e, t) => (e + (e >= 0 ? t : -t) / _2n) / t;
function _splitEndoScalar(e, t, n) {
	let [[r, i], [a, o]] = t, s = divNearest(o * e, n), c = divNearest(-i * e, n), l = e - s * r - c * a, u = -s * i - c * o, d = l < _0n, f = u < _0n;
	d && (l = -l), f && (u = -u);
	let p = bitMask(Math.ceil(bitLen(n) / 2)) + _1n;
	if (l < _0n || l >= p || u < _0n || u >= p) throw Error("splitScalar (endomorphism): failed, k=" + e);
	return {
		k1neg: d,
		k1: l,
		k2neg: f,
		k2: u
	};
}
function validateSigFormat(e) {
	if (![
		"compact",
		"recovered",
		"der"
	].includes(e)) throw Error("Signature format must be \"compact\", \"recovered\", or \"der\"");
	return e;
}
function validateSigOpts(e, t) {
	let n = {};
	for (let r of Object.keys(t)) n[r] = e[r] === void 0 ? t[r] : e[r];
	return _abool2(n.lowS, "lowS"), _abool2(n.prehash, "prehash"), n.format !== void 0 && validateSigFormat(n.format), n;
}
const DER = {
	Err: class extends Error {
		constructor(e = "") {
			super(e);
		}
	},
	_tlv: {
		encode: (e, t) => {
			let { Err: n } = DER;
			if (e < 0 || e > 256) throw new n("tlv.encode: wrong tag");
			if (t.length & 1) throw new n("tlv.encode: unpadded data");
			let r = t.length / 2, i = numberToHexUnpadded(r);
			if (i.length / 2 & 128) throw new n("tlv.encode: long form length too big");
			let a = r > 127 ? numberToHexUnpadded(i.length / 2 | 128) : "";
			return numberToHexUnpadded(e) + a + i + t;
		},
		decode(e, t) {
			let { Err: n } = DER, r = 0;
			if (e < 0 || e > 256) throw new n("tlv.encode: wrong tag");
			if (t.length < 2 || t[r++] !== e) throw new n("tlv.decode: wrong tlv");
			let i = t[r++], a = !!(i & 128), o = 0;
			if (!a) o = i;
			else {
				let e = i & 127;
				if (!e) throw new n("tlv.decode(long): indefinite length not supported");
				if (e > 4) throw new n("tlv.decode(long): byte length is too big");
				let a = t.subarray(r, r + e);
				if (a.length !== e) throw new n("tlv.decode: length bytes not complete");
				if (a[0] === 0) throw new n("tlv.decode(long): zero leftmost byte");
				for (let e of a) o = o << 8 | e;
				if (r += e, o < 128) throw new n("tlv.decode(long): not minimal encoding");
			}
			let s = t.subarray(r, r + o);
			if (s.length !== o) throw new n("tlv.decode: wrong value length");
			return {
				v: s,
				l: t.subarray(r + o)
			};
		}
	},
	_int: {
		encode(e) {
			let { Err: t } = DER;
			if (e < _0n) throw new t("integer: negative integers are not allowed");
			let n = numberToHexUnpadded(e);
			if (Number.parseInt(n[0], 16) & 8 && (n = "00" + n), n.length & 1) throw new t("unexpected DER parsing assertion: unpadded hex");
			return n;
		},
		decode(e) {
			let { Err: t } = DER;
			if (e[0] & 128) throw new t("invalid signature integer: negative");
			if (e[0] === 0 && !(e[1] & 128)) throw new t("invalid signature integer: unnecessary leading zero");
			return bytesToNumberBE(e);
		}
	},
	toSig(e) {
		let { Err: t, _int: n, _tlv: r } = DER, i = ensureBytes("signature", e), { v: a, l: o } = r.decode(48, i);
		if (o.length) throw new t("invalid signature: left bytes after parsing");
		let { v: s, l: c } = r.decode(2, a), { v: l, l: u } = r.decode(2, c);
		if (u.length) throw new t("invalid signature: left bytes after parsing");
		return {
			r: n.decode(s),
			s: n.decode(l)
		};
	},
	hexFromSig(e) {
		let { _tlv: t, _int: n } = DER, r = t.encode(2, n.encode(e.r)) + t.encode(2, n.encode(e.s));
		return t.encode(48, r);
	}
};
var _0n = BigInt(0), _1n = BigInt(1), _2n = BigInt(2), _3n = BigInt(3), _4n = BigInt(4);
function _normFnElement(e, t) {
	let { BYTES: n } = e, r;
	if (typeof t == "bigint") r = t;
	else {
		let i = ensureBytes("private key", t);
		try {
			r = e.fromBytes(i);
		} catch {
			throw Error(`invalid private key: expected ui8a of size ${n}, got ${typeof t}`);
		}
	}
	if (!e.isValidNot0(r)) throw Error("invalid private key: out of range [1..N-1]");
	return r;
}
function weierstrassN(e, t = {}) {
	let n = _createCurveFields("weierstrass", e, t), { Fp: r, Fn: i } = n, a = n.CURVE, { h: o, n: s } = a;
	_validateObject(t, {}, {
		allowInfinityPoint: "boolean",
		clearCofactor: "function",
		isTorsionFree: "function",
		fromBytes: "function",
		toBytes: "function",
		endo: "object",
		wrapPrivateKey: "boolean"
	});
	let { endo: c } = t;
	if (c && (!r.is0(a.a) || typeof c.beta != "bigint" || !Array.isArray(c.basises))) throw Error("invalid endo: expected \"beta\": bigint and \"basises\": array");
	let l = getWLengths(r, i);
	function u() {
		if (!r.isOdd) throw Error("compression is not supported: Field does not have .isOdd()");
	}
	function d(e, t, n) {
		let { x: i, y: a } = t.toAffine(), o = r.toBytes(i);
		return _abool2(n, "isCompressed"), n ? (u(), concatBytes$1(pprefix(!r.isOdd(a)), o)) : concatBytes$1(Uint8Array.of(4), o, r.toBytes(a));
	}
	function f(e) {
		_abytes2(e, void 0, "Point");
		let { publicKey: t, publicKeyUncompressed: n } = l, i = e.length, a = e[0], o = e.subarray(1);
		if (i === t && (a === 2 || a === 3)) {
			let e = r.fromBytes(o);
			if (!r.isValid(e)) throw Error("bad point: is not on curve, wrong x");
			let t = g(e), n;
			try {
				n = r.sqrt(t);
			} catch (e) {
				let t = e instanceof Error ? ": " + e.message : "";
				throw Error("bad point: is not on curve, sqrt error" + t);
			}
			u();
			let i = r.isOdd(n);
			return (a & 1) == 1 !== i && (n = r.neg(n)), {
				x: e,
				y: n
			};
		} else if (i === n && a === 4) {
			let e = r.BYTES, t = r.fromBytes(o.subarray(0, e)), n = r.fromBytes(o.subarray(e, e * 2));
			if (!_(t, n)) throw Error("bad point: is not on curve");
			return {
				x: t,
				y: n
			};
		} else throw Error(`bad point: got length ${i}, expected compressed=${t} or uncompressed=${n}`);
	}
	let p = t.toBytes || d, m = t.fromBytes || f;
	function g(e) {
		let t = r.sqr(e), n = r.mul(t, e);
		return r.add(r.add(n, r.mul(e, a.a)), a.b);
	}
	function _(e, t) {
		let n = r.sqr(t), i = g(e);
		return r.eql(n, i);
	}
	if (!_(a.Gx, a.Gy)) throw Error("bad curve params: generator point");
	let v = r.mul(r.pow(a.a, _3n), _4n), y = r.mul(r.sqr(a.b), BigInt(27));
	if (r.is0(r.add(v, y))) throw Error("bad curve params: a or b");
	function b(e, t, n = !1) {
		if (!r.isValid(t) || n && r.is0(t)) throw Error(`bad point coordinate ${e}`);
		return t;
	}
	function x(e) {
		if (!(e instanceof E)) throw Error("ProjectivePoint expected");
	}
	function S(e) {
		if (!c || !c.basises) throw Error("no endo");
		return _splitEndoScalar(e, c.basises, i.ORDER);
	}
	let C = memoized((e, t) => {
		let { X: n, Y: i, Z: a } = e;
		if (r.eql(a, r.ONE)) return {
			x: n,
			y: i
		};
		let o = e.is0();
		t ??= o ? r.ONE : r.inv(a);
		let s = r.mul(n, t), c = r.mul(i, t), l = r.mul(a, t);
		if (o) return {
			x: r.ZERO,
			y: r.ZERO
		};
		if (!r.eql(l, r.ONE)) throw Error("invZ was invalid");
		return {
			x: s,
			y: c
		};
	}), w = memoized((e) => {
		if (e.is0()) {
			if (t.allowInfinityPoint && !r.is0(e.Y)) return;
			throw Error("bad point: ZERO");
		}
		let { x: n, y: i } = e.toAffine();
		if (!r.isValid(n) || !r.isValid(i)) throw Error("bad point: x or y not field elements");
		if (!_(n, i)) throw Error("bad point: equation left != right");
		if (!e.isTorsionFree()) throw Error("bad point: not in prime-order subgroup");
		return !0;
	});
	function T(e, t, n, i, a) {
		return n = new E(r.mul(n.X, e), n.Y, n.Z), t = negateCt(i, t), n = negateCt(a, n), t.add(n);
	}
	class E {
		constructor(e, t, n) {
			this.X = b("x", e), this.Y = b("y", t, !0), this.Z = b("z", n), Object.freeze(this);
		}
		static CURVE() {
			return a;
		}
		static fromAffine(e) {
			let { x: t, y: n } = e || {};
			if (!e || !r.isValid(t) || !r.isValid(n)) throw Error("invalid affine point");
			if (e instanceof E) throw Error("projective point not allowed");
			return r.is0(t) && r.is0(n) ? E.ZERO : new E(t, n, r.ONE);
		}
		static fromBytes(e) {
			let t = E.fromAffine(m(_abytes2(e, void 0, "point")));
			return t.assertValidity(), t;
		}
		static fromHex(e) {
			return E.fromBytes(ensureBytes("pointHex", e));
		}
		get x() {
			return this.toAffine().x;
		}
		get y() {
			return this.toAffine().y;
		}
		precompute(e = 8, t = !0) {
			return O.createCache(this, e), t || this.multiply(_3n), this;
		}
		assertValidity() {
			w(this);
		}
		hasEvenY() {
			let { y: e } = this.toAffine();
			if (!r.isOdd) throw Error("Field doesn't support isOdd");
			return !r.isOdd(e);
		}
		equals(e) {
			x(e);
			let { X: t, Y: n, Z: i } = this, { X: a, Y: o, Z: s } = e, c = r.eql(r.mul(t, s), r.mul(a, i)), l = r.eql(r.mul(n, s), r.mul(o, i));
			return c && l;
		}
		negate() {
			return new E(this.X, r.neg(this.Y), this.Z);
		}
		double() {
			let { a: e, b: t } = a, n = r.mul(t, _3n), { X: i, Y: o, Z: s } = this, c = r.ZERO, l = r.ZERO, u = r.ZERO, d = r.mul(i, i), f = r.mul(o, o), p = r.mul(s, s), m = r.mul(i, o);
			return m = r.add(m, m), u = r.mul(i, s), u = r.add(u, u), c = r.mul(e, u), l = r.mul(n, p), l = r.add(c, l), c = r.sub(f, l), l = r.add(f, l), l = r.mul(c, l), c = r.mul(m, c), u = r.mul(n, u), p = r.mul(e, p), m = r.sub(d, p), m = r.mul(e, m), m = r.add(m, u), u = r.add(d, d), d = r.add(u, d), d = r.add(d, p), d = r.mul(d, m), l = r.add(l, d), p = r.mul(o, s), p = r.add(p, p), d = r.mul(p, m), c = r.sub(c, d), u = r.mul(p, f), u = r.add(u, u), u = r.add(u, u), new E(c, l, u);
		}
		add(e) {
			x(e);
			let { X: t, Y: n, Z: i } = this, { X: o, Y: s, Z: c } = e, l = r.ZERO, u = r.ZERO, d = r.ZERO, f = a.a, p = r.mul(a.b, _3n), m = r.mul(t, o), g = r.mul(n, s), _ = r.mul(i, c), v = r.add(t, n), y = r.add(o, s);
			v = r.mul(v, y), y = r.add(m, g), v = r.sub(v, y), y = r.add(t, i);
			let b = r.add(o, c);
			return y = r.mul(y, b), b = r.add(m, _), y = r.sub(y, b), b = r.add(n, i), l = r.add(s, c), b = r.mul(b, l), l = r.add(g, _), b = r.sub(b, l), d = r.mul(f, y), l = r.mul(p, _), d = r.add(l, d), l = r.sub(g, d), d = r.add(g, d), u = r.mul(l, d), g = r.add(m, m), g = r.add(g, m), _ = r.mul(f, _), y = r.mul(p, y), g = r.add(g, _), _ = r.sub(m, _), _ = r.mul(f, _), y = r.add(y, _), m = r.mul(g, y), u = r.add(u, m), m = r.mul(b, y), l = r.mul(v, l), l = r.sub(l, m), m = r.mul(v, g), d = r.mul(b, d), d = r.add(d, m), new E(l, u, d);
		}
		subtract(e) {
			return this.add(e.negate());
		}
		is0() {
			return this.equals(E.ZERO);
		}
		multiply(e) {
			let { endo: n } = t;
			if (!i.isValidNot0(e)) throw Error("invalid scalar: out of range");
			let r, a, o = (e) => O.cached(this, e, (e) => normalizeZ(E, e));
			if (n) {
				let { k1neg: t, k1: i, k2neg: s, k2: c } = S(e), { p: l, f: u } = o(i), { p: d, f } = o(c);
				a = u.add(f), r = T(n.beta, l, d, t, s);
			} else {
				let { p: t, f: n } = o(e);
				r = t, a = n;
			}
			return normalizeZ(E, [r, a])[0];
		}
		multiplyUnsafe(e) {
			let { endo: n } = t, r = this;
			if (!i.isValid(e)) throw Error("invalid scalar: out of range");
			if (e === _0n || r.is0()) return E.ZERO;
			if (e === _1n) return r;
			if (O.hasCache(this)) return this.multiply(e);
			if (n) {
				let { k1neg: t, k1: i, k2neg: a, k2: o } = S(e), { p1: s, p2: c } = mulEndoUnsafe(E, r, i, o);
				return T(n.beta, s, c, t, a);
			} else return O.unsafe(r, e);
		}
		multiplyAndAddUnsafe(e, t, n) {
			let r = this.multiplyUnsafe(t).add(e.multiplyUnsafe(n));
			return r.is0() ? void 0 : r;
		}
		toAffine(e) {
			return C(this, e);
		}
		isTorsionFree() {
			let { isTorsionFree: e } = t;
			return o === _1n ? !0 : e ? e(E, this) : O.unsafe(this, s).is0();
		}
		clearCofactor() {
			let { clearCofactor: e } = t;
			return o === _1n ? this : e ? e(E, this) : this.multiplyUnsafe(o);
		}
		isSmallOrder() {
			return this.multiplyUnsafe(o).is0();
		}
		toBytes(e = !0) {
			return _abool2(e, "isCompressed"), this.assertValidity(), p(E, this, e);
		}
		toHex(e = !0) {
			return bytesToHex$1(this.toBytes(e));
		}
		toString() {
			return `<Point ${this.is0() ? "ZERO" : this.toHex()}>`;
		}
		get px() {
			return this.X;
		}
		get py() {
			return this.X;
		}
		get pz() {
			return this.Z;
		}
		toRawBytes(e = !0) {
			return this.toBytes(e);
		}
		_setWindowSize(e) {
			this.precompute(e);
		}
		static normalizeZ(e) {
			return normalizeZ(E, e);
		}
		static msm(e, t) {
			return pippenger(E, i, e, t);
		}
		static fromPrivateKey(e) {
			return E.BASE.multiply(_normFnElement(i, e));
		}
	}
	E.BASE = new E(a.Gx, a.Gy, r.ONE), E.ZERO = new E(r.ZERO, r.ONE, r.ZERO), E.Fp = r, E.Fn = i;
	let D = i.BITS, O = new wNAF(E, t.endo ? Math.ceil(D / 2) : D);
	return E.BASE.precompute(8), E;
}
function pprefix(e) {
	return Uint8Array.of(e ? 2 : 3);
}
function getWLengths(e, t) {
	return {
		secretKey: t.BYTES,
		publicKey: 1 + e.BYTES,
		publicKeyUncompressed: 1 + 2 * e.BYTES,
		publicKeyHasPrefix: !0,
		signature: 2 * t.BYTES
	};
}
function ecdh(e, t = {}) {
	let { Fn: n } = e, r = t.randomBytes || randomBytes$1, i = Object.assign(getWLengths(e.Fp, n), { seed: getMinHashLength(n.ORDER) });
	function a(e) {
		try {
			return !!_normFnElement(n, e);
		} catch {
			return !1;
		}
	}
	function o(t, n) {
		let { publicKey: r, publicKeyUncompressed: a } = i;
		try {
			let i = t.length;
			return n === !0 && i !== r || n === !1 && i !== a ? !1 : !!e.fromBytes(t);
		} catch {
			return !1;
		}
	}
	function s(e = r(i.seed)) {
		return mapHashToField(_abytes2(e, i.seed, "seed"), n.ORDER);
	}
	function c(t, r = !0) {
		return e.BASE.multiply(_normFnElement(n, t)).toBytes(r);
	}
	function l(e) {
		let t = s(e);
		return {
			secretKey: t,
			publicKey: c(t)
		};
	}
	function u(t) {
		if (typeof t == "bigint") return !1;
		if (t instanceof e) return !0;
		let { secretKey: r, publicKey: a, publicKeyUncompressed: o } = i;
		if (n.allowedLengths || r === a) return;
		let s = ensureBytes("key", t).length;
		return s === a || s === o;
	}
	function d(t, r, i = !0) {
		if (u(t) === !0) throw Error("first arg must be private key");
		if (u(r) === !1) throw Error("second arg must be public key");
		let a = _normFnElement(n, t);
		return e.fromHex(r).multiply(a).toBytes(i);
	}
	let f = {
		isValidSecretKey: a,
		isValidPublicKey: o,
		randomSecretKey: s,
		isValidPrivateKey: a,
		randomPrivateKey: s,
		normPrivateKeyToScalar: (e) => _normFnElement(n, e),
		precompute(t = 8, n = e.BASE) {
			return n.precompute(t, !1);
		}
	};
	return Object.freeze({
		getPublicKey: c,
		getSharedSecret: d,
		keygen: l,
		Point: e,
		utils: f,
		lengths: i
	});
}
function ecdsa(e, t, n = {}) {
	ahash(t), _validateObject(n, {}, {
		hmac: "function",
		lowS: "boolean",
		randomBytes: "function",
		bits2int: "function",
		bits2int_modN: "function"
	});
	let r = n.randomBytes || randomBytes$1, i = n.hmac || ((e, ...n) => hmac$1(t, e, concatBytes$1(...n))), { Fp: a, Fn: o } = e, { ORDER: s, BITS: c } = o, { keygen: l, getPublicKey: u, getSharedSecret: d, utils: f, lengths: p } = ecdh(e, n), m = {
		prehash: !1,
		lowS: typeof n.lowS == "boolean" ? n.lowS : !1,
		format: void 0,
		extraEntropy: !1
	}, g = "compact";
	function _(e) {
		return e > s >> _1n;
	}
	function v(e, t) {
		if (!o.isValidNot0(t)) throw Error(`invalid signature ${e}: out of range 1..Point.Fn.ORDER`);
		return t;
	}
	function y(e, t) {
		validateSigFormat(t);
		let n = p.signature;
		return _abytes2(e, t === "compact" ? n : t === "recovered" ? n + 1 : void 0, `${t} signature`);
	}
	class b {
		constructor(e, t, n) {
			this.r = v("r", e), this.s = v("s", t), n != null && (this.recovery = n), Object.freeze(this);
		}
		static fromBytes(e, t = g) {
			y(e, t);
			let n;
			if (t === "der") {
				let { r: t, s: n } = DER.toSig(_abytes2(e));
				return new b(t, n);
			}
			t === "recovered" && (n = e[0], t = "compact", e = e.subarray(1));
			let r = o.BYTES, i = e.subarray(0, r), a = e.subarray(r, r * 2);
			return new b(o.fromBytes(i), o.fromBytes(a), n);
		}
		static fromHex(e, t) {
			return this.fromBytes(hexToBytes(e), t);
		}
		addRecoveryBit(e) {
			return new b(this.r, this.s, e);
		}
		recoverPublicKey(t) {
			let n = a.ORDER, { r, s: i, recovery: c } = this;
			if (c == null || ![
				0,
				1,
				2,
				3
			].includes(c)) throw Error("recovery id invalid");
			if (s * _2n < n && c > 1) throw Error("recovery id is ambiguous for h>1 curve");
			let l = c === 2 || c === 3 ? r + s : r;
			if (!a.isValid(l)) throw Error("recovery id 2 or 3 invalid");
			let u = a.toBytes(l), d = e.fromBytes(concatBytes$1(pprefix((c & 1) == 0), u)), f = o.inv(l), p = S(ensureBytes("msgHash", t)), m = o.create(-p * f), g = o.create(i * f), _ = e.BASE.multiplyUnsafe(m).add(d.multiplyUnsafe(g));
			if (_.is0()) throw Error("point at infinify");
			return _.assertValidity(), _;
		}
		hasHighS() {
			return _(this.s);
		}
		toBytes(e = g) {
			if (validateSigFormat(e), e === "der") return hexToBytes(DER.hexFromSig(this));
			let t = o.toBytes(this.r), n = o.toBytes(this.s);
			if (e === "recovered") {
				if (this.recovery == null) throw Error("recovery bit must be present");
				return concatBytes$1(Uint8Array.of(this.recovery), t, n);
			}
			return concatBytes$1(t, n);
		}
		toHex(e) {
			return bytesToHex$1(this.toBytes(e));
		}
		assertValidity() {}
		static fromCompact(e) {
			return b.fromBytes(ensureBytes("sig", e), "compact");
		}
		static fromDER(e) {
			return b.fromBytes(ensureBytes("sig", e), "der");
		}
		normalizeS() {
			return this.hasHighS() ? new b(this.r, o.neg(this.s), this.recovery) : this;
		}
		toDERRawBytes() {
			return this.toBytes("der");
		}
		toDERHex() {
			return bytesToHex$1(this.toBytes("der"));
		}
		toCompactRawBytes() {
			return this.toBytes("compact");
		}
		toCompactHex() {
			return bytesToHex$1(this.toBytes("compact"));
		}
	}
	let x = n.bits2int || function(e) {
		if (e.length > 8192) throw Error("input is too large");
		let t = bytesToNumberBE(e), n = e.length * 8 - c;
		return n > 0 ? t >> BigInt(n) : t;
	}, S = n.bits2int_modN || function(e) {
		return o.create(x(e));
	}, C = bitMask(c);
	function w(e) {
		return aInRange("num < 2^" + c, e, _0n, C), o.toBytes(e);
	}
	function T(e, n) {
		return _abytes2(e, void 0, "message"), n ? _abytes2(t(e), void 0, "prehashed message") : e;
	}
	function E(t, n, i) {
		if (["recovered", "canonical"].some((e) => e in i)) throw Error("sign() legacy options not supported");
		let { lowS: a, prehash: s, extraEntropy: c } = validateSigOpts(i, m);
		t = T(t, s);
		let l = S(t), u = _normFnElement(o, n), d = [w(u), w(l)];
		if (c != null && c !== !1) {
			let e = c === !0 ? r(p.secretKey) : c;
			d.push(ensureBytes("extraEntropy", e));
		}
		let f = concatBytes$1(...d), g = l;
		function v(t) {
			let n = x(t);
			if (!o.isValidNot0(n)) return;
			let r = o.inv(n), i = e.BASE.multiply(n).toAffine(), s = o.create(i.x);
			if (s === _0n) return;
			let c = o.create(r * o.create(g + s * u));
			if (c === _0n) return;
			let l = (i.x === s ? 0 : 2) | Number(i.y & _1n), d = c;
			return a && _(c) && (d = o.neg(c), l ^= 1), new b(s, d, l);
		}
		return {
			seed: f,
			k2sig: v
		};
	}
	function D(e, n, r = {}) {
		e = ensureBytes("message", e);
		let { seed: a, k2sig: s } = E(e, n, r);
		return createHmacDrbg(t.outputLen, o.BYTES, i)(a, s);
	}
	function O(e) {
		let t, n = typeof e == "string" || isBytes$1(e), r = !n && typeof e == "object" && !!e && typeof e.r == "bigint" && typeof e.s == "bigint";
		if (!n && !r) throw Error("invalid signature, expected Uint8Array, hex string or Signature instance");
		if (r) t = new b(e.r, e.s);
		else if (n) {
			try {
				t = b.fromBytes(ensureBytes("sig", e), "der");
			} catch (e) {
				if (!(e instanceof DER.Err)) throw e;
			}
			if (!t) try {
				t = b.fromBytes(ensureBytes("sig", e), "compact");
			} catch {
				return !1;
			}
		}
		return t || !1;
	}
	function k(t, n, r, i = {}) {
		let { lowS: a, prehash: s, format: c } = validateSigOpts(i, m);
		if (r = ensureBytes("publicKey", r), n = T(ensureBytes("message", n), s), "strict" in i) throw Error("options.strict was renamed to lowS");
		let l = c === void 0 ? O(t) : b.fromBytes(ensureBytes("sig", t), c);
		if (l === !1) return !1;
		try {
			let t = e.fromBytes(r);
			if (a && l.hasHighS()) return !1;
			let { r: i, s } = l, c = S(n), u = o.inv(s), d = o.create(c * u), f = o.create(i * u), p = e.BASE.multiplyUnsafe(d).add(t.multiplyUnsafe(f));
			return p.is0() ? !1 : o.create(p.x) === i;
		} catch {
			return !1;
		}
	}
	function A(e, t, n = {}) {
		let { prehash: r } = validateSigOpts(n, m);
		return t = T(t, r), b.fromBytes(e, "recovered").recoverPublicKey(t).toBytes();
	}
	return Object.freeze({
		keygen: l,
		getPublicKey: u,
		getSharedSecret: d,
		utils: f,
		lengths: p,
		Point: e,
		sign: D,
		verify: k,
		recoverPublicKey: A,
		Signature: b,
		hash: t
	});
}
function _weierstrass_legacy_opts_to_new(e) {
	let t = {
		a: e.a,
		b: e.b,
		p: e.Fp.ORDER,
		n: e.n,
		h: e.h,
		Gx: e.Gx,
		Gy: e.Gy
	}, n = e.Fp, r = e.allowedPrivateKeyLengths ? Array.from(new Set(e.allowedPrivateKeyLengths.map((e) => Math.ceil(e / 2)))) : void 0;
	return {
		CURVE: t,
		curveOpts: {
			Fp: n,
			Fn: Field(t.n, {
				BITS: e.nBitLength,
				allowedLengths: r,
				modFromBytes: e.wrapPrivateKey
			}),
			allowInfinityPoint: e.allowInfinityPoint,
			endo: e.endo,
			isTorsionFree: e.isTorsionFree,
			clearCofactor: e.clearCofactor,
			fromBytes: e.fromBytes,
			toBytes: e.toBytes
		}
	};
}
function _ecdsa_legacy_opts_to_new(e) {
	let { CURVE: t, curveOpts: n } = _weierstrass_legacy_opts_to_new(e), r = {
		hmac: e.hmac,
		randomBytes: e.randomBytes,
		lowS: e.lowS,
		bits2int: e.bits2int,
		bits2int_modN: e.bits2int_modN
	};
	return {
		CURVE: t,
		curveOpts: n,
		hash: e.hash,
		ecdsaOpts: r
	};
}
function _ecdsa_new_output_to_legacy(e, t) {
	let n = t.Point;
	return Object.assign({}, t, {
		ProjectivePoint: n,
		CURVE: Object.assign({}, e, nLength(n.Fn.ORDER, n.Fn.BITS))
	});
}
function weierstrass(e) {
	let { CURVE: t, curveOpts: n, hash: r, ecdsaOpts: i } = _ecdsa_legacy_opts_to_new(e);
	return _ecdsa_new_output_to_legacy(e, ecdsa(weierstrassN(t, n), r, i));
}
function isBytes(e) {
	return e instanceof Uint8Array || ArrayBuffer.isView(e) && e.constructor.name === "Uint8Array";
}
function abytes(e, ...t) {
	if (!isBytes(e)) throw Error("Uint8Array expected");
	if (t.length > 0 && !t.includes(e.length)) throw Error("Uint8Array expected of length " + t + ", got length=" + e.length);
}
function aexists(e, t = !0) {
	if (e.destroyed) throw Error("Hash instance has been destroyed");
	if (t && e.finished) throw Error("Hash#digest() has already been called");
}
function aoutput(e, t) {
	abytes(e);
	let n = t.outputLen;
	if (e.length < n) throw Error("digestInto() expects output buffer of length at least " + n);
}
function u32(e) {
	return new Uint32Array(e.buffer, e.byteOffset, Math.floor(e.byteLength / 4));
}
function clean(...e) {
	for (let t = 0; t < e.length; t++) e[t].fill(0);
}
function createView(e) {
	return new DataView(e.buffer, e.byteOffset, e.byteLength);
}
function utf8ToBytes$1(e) {
	if (typeof e != "string") throw Error("string expected");
	return new Uint8Array(new TextEncoder().encode(e));
}
function toBytes$1(e) {
	if (typeof e == "string") e = utf8ToBytes$1(e);
	else if (isBytes(e)) e = copyBytes(e);
	else throw Error("Uint8Array expected, got " + typeof e);
	return e;
}
function setBigUint64(e, t, n, r) {
	if (typeof e.setBigUint64 == "function") return e.setBigUint64(t, n, r);
	let i = BigInt(32), a = BigInt(4294967295), o = Number(n >> i & a), s = Number(n & a), c = r ? 4 : 0, l = r ? 0 : 4;
	e.setUint32(t + c, o, r), e.setUint32(t + l, s, r);
}
function copyBytes(e) {
	return Uint8Array.from(e);
}
var BLOCK_SIZE = 16, ZEROS16 = /* @__PURE__ */ new Uint8Array(16), ZEROS32 = u32(ZEROS16), POLY = 225, mul2 = (e, t, n, r) => {
	let i = r & 1;
	return {
		s3: n << 31 | r >>> 1,
		s2: t << 31 | n >>> 1,
		s1: e << 31 | t >>> 1,
		s0: e >>> 1 ^ POLY << 24 & -(i & 1)
	};
}, swapLE = (e) => (e >>> 0 & 255) << 24 | (e >>> 8 & 255) << 16 | (e >>> 16 & 255) << 8 | e >>> 24 & 255 | 0;
function _toGHASHKey(e) {
	e.reverse();
	let t = e[15] & 1, n = 0;
	for (let t = 0; t < e.length; t++) {
		let r = e[t];
		e[t] = r >>> 1 | n, n = (r & 1) << 7;
	}
	return e[0] ^= -t & 225, e;
}
var estimateWindow = (e) => e > 64 * 1024 ? 8 : e > 1024 ? 4 : 2, GHASH = class {
	constructor(e, t) {
		this.blockLen = BLOCK_SIZE, this.outputLen = BLOCK_SIZE, this.s0 = 0, this.s1 = 0, this.s2 = 0, this.s3 = 0, this.finished = !1, e = toBytes$1(e), abytes(e, 16);
		let n = createView(e), r = n.getUint32(0, !1), i = n.getUint32(4, !1), a = n.getUint32(8, !1), o = n.getUint32(12, !1), s = [];
		for (let e = 0; e < 128; e++) s.push({
			s0: swapLE(r),
			s1: swapLE(i),
			s2: swapLE(a),
			s3: swapLE(o)
		}), {s0: r, s1: i, s2: a, s3: o} = mul2(r, i, a, o);
		let c = estimateWindow(t || 1024);
		if (![
			1,
			2,
			4,
			8
		].includes(c)) throw Error("ghash: invalid window size, expected 2, 4 or 8");
		this.W = c;
		let l = 128 / c, u = this.windowSize = 2 ** c, d = [];
		for (let e = 0; e < l; e++) for (let t = 0; t < u; t++) {
			let n = 0, r = 0, i = 0, a = 0;
			for (let o = 0; o < c; o++) {
				if (!(t >>> c - o - 1 & 1)) continue;
				let { s0: l, s1: u, s2: d, s3: f } = s[c * e + o];
				n ^= l, r ^= u, i ^= d, a ^= f;
			}
			d.push({
				s0: n,
				s1: r,
				s2: i,
				s3: a
			});
		}
		this.t = d;
	}
	_updateBlock(e, t, n, r) {
		e ^= this.s0, t ^= this.s1, n ^= this.s2, r ^= this.s3;
		let { W: i, t: a, windowSize: o } = this, s = 0, c = 0, l = 0, u = 0, d = (1 << i) - 1, f = 0;
		for (let p of [
			e,
			t,
			n,
			r
		]) for (let e = 0; e < 4; e++) {
			let t = p >>> 8 * e & 255;
			for (let e = 8 / i - 1; e >= 0; e--) {
				let n = t >>> i * e & d, { s0: r, s1: p, s2: m, s3: g } = a[f * o + n];
				s ^= r, c ^= p, l ^= m, u ^= g, f += 1;
			}
		}
		this.s0 = s, this.s1 = c, this.s2 = l, this.s3 = u;
	}
	update(e) {
		aexists(this), e = toBytes$1(e), abytes(e);
		let t = u32(e), n = Math.floor(e.length / BLOCK_SIZE), r = e.length % BLOCK_SIZE;
		for (let e = 0; e < n; e++) this._updateBlock(t[e * 4 + 0], t[e * 4 + 1], t[e * 4 + 2], t[e * 4 + 3]);
		return r && (ZEROS16.set(e.subarray(n * BLOCK_SIZE)), this._updateBlock(ZEROS32[0], ZEROS32[1], ZEROS32[2], ZEROS32[3]), clean(ZEROS32)), this;
	}
	destroy() {
		let { t: e } = this;
		for (let t of e) t.s0 = 0, t.s1 = 0, t.s2 = 0, t.s3 = 0;
	}
	digestInto(e) {
		aexists(this), aoutput(e, this), this.finished = !0;
		let { s0: t, s1: n, s2: r, s3: i } = this, a = u32(e);
		return a[0] = t, a[1] = n, a[2] = r, a[3] = i, e;
	}
	digest() {
		let e = new Uint8Array(BLOCK_SIZE);
		return this.digestInto(e), this.destroy(), e;
	}
}, Polyval = class extends GHASH {
	constructor(e, t) {
		e = toBytes$1(e), abytes(e);
		let n = _toGHASHKey(copyBytes(e));
		super(n, t), clean(n);
	}
	update(e) {
		e = toBytes$1(e), aexists(this);
		let t = u32(e), n = e.length % BLOCK_SIZE, r = Math.floor(e.length / BLOCK_SIZE);
		for (let e = 0; e < r; e++) this._updateBlock(swapLE(t[e * 4 + 3]), swapLE(t[e * 4 + 2]), swapLE(t[e * 4 + 1]), swapLE(t[e * 4 + 0]));
		return n && (ZEROS16.set(e.subarray(r * BLOCK_SIZE)), this._updateBlock(swapLE(ZEROS32[3]), swapLE(ZEROS32[2]), swapLE(ZEROS32[1]), swapLE(ZEROS32[0])), clean(ZEROS32)), this;
	}
	digestInto(e) {
		aexists(this), aoutput(e, this), this.finished = !0;
		let { s0: t, s1: n, s2: r, s3: i } = this, a = u32(e);
		return a[0] = t, a[1] = n, a[2] = r, a[3] = i, e.reverse();
	}
};
function wrapConstructorWithKey(e) {
	let t = (t, n) => e(n, t.length).update(toBytes$1(t)).digest(), n = e(new Uint8Array(16), 0);
	return t.outputLen = n.outputLen, t.blockLen = n.blockLen, t.create = (t, n) => e(t, n), t;
}
const ghash = wrapConstructorWithKey((e, t) => new GHASH(e, t));
wrapConstructorWithKey((e, t) => new Polyval(e, t));
var __defProp = Object.defineProperty, __export = (e, t) => {
	for (var n in t) __defProp(e, n, {
		get: t[n],
		enumerable: !0
	});
}, sm2_exports = {};
__export(sm2_exports, {
	EmptyArray: () => EmptyArray,
	arrayToHex: () => arrayToHex,
	arrayToUtf8: () => arrayToUtf8,
	calculateSharedKey: () => calculateSharedKey,
	comparePublicKeyHex: () => comparePublicKeyHex,
	compressPublicKeyHex: () => compressPublicKeyHex,
	doDecrypt: () => doDecrypt,
	doEncrypt: () => doEncrypt,
	doSignature: () => doSignature,
	doVerifySignature: () => doVerifySignature,
	generateKeyPairHex: () => generateKeyPairHex,
	getHash: () => getHash,
	getPoint: () => getPoint,
	getPublicKeyFromPrivateKey: () => getPublicKeyFromPrivateKey,
	getZ: () => getZ,
	hexToArray: () => hexToArray,
	initRNGPool: () => initRNGPool,
	leftPad: () => leftPad,
	precomputePublicKey: () => precomputePublicKey,
	utf8ToHex: () => utf8ToHex,
	verifyPublicKey: () => verifyPublicKey
});
var ZERO = BigInt(0), ONE = BigInt(1), TWO = BigInt(2);
function bigintToValue(e) {
	let t = e.toString(16);
	if (t[0] !== "-") t.length % 2 == 1 ? t = "0" + t : t.match(/^[0-7]/) || (t = "00" + t);
	else {
		t = t.substring(1);
		let n = t.length;
		n % 2 == 1 ? n += 1 : t.match(/^[0-7]/) || (n += 2);
		let r = "";
		for (let e = 0; e < n; e++) r += "f";
		t = ((hexToNumber(r) ^ e) + ONE).toString(16).replace(/^-/, "");
	}
	return t;
}
var ASN1Object = class {
	constructor(e = null, t = "00", n = "00", r = "") {
		this.tlv = e, this.t = t, this.l = n, this.v = r;
	}
	getEncodedHex() {
		return this.tlv ||= (this.v = this.getValue(), this.l = this.getLength(), this.t + this.l + this.v), this.tlv;
	}
	getLength() {
		let e = this.v.length / 2, t = e.toString(16);
		return t.length % 2 == 1 && (t = "0" + t), e < 128 ? t : (128 + t.length / 2).toString(16) + t;
	}
	getValue() {
		return "";
	}
}, DERInteger = class extends ASN1Object {
	constructor(e) {
		super(), this.t = "02", e && (this.v = bigintToValue(e));
	}
	getValue() {
		return this.v;
	}
}, DEROctetString = class extends ASN1Object {
	constructor(e) {
		super(), this.s = e, this.t = "04", e && (this.v = e.toLowerCase());
	}
	hV = "";
	getValue() {
		return this.v;
	}
}, DERSequence = class extends ASN1Object {
	constructor(e) {
		super(), this.asn1Array = e;
	}
	t = "30";
	getValue() {
		return this.v = this.asn1Array.map((e) => e.getEncodedHex()).join(""), this.v;
	}
};
function getLenOfL(e, t) {
	if (+e[t + 2] < 8) return 1;
	let n = e.slice(t + 2, t + 6).slice(0, 2);
	return (parseInt(n, 16) - 128) * 2;
}
function getL(e, t) {
	let n = getLenOfL(e, t), r = e.substring(t + 2, t + 2 + n * 2);
	return r ? +(+r[0] < 8 ? hexToNumber(r) : hexToNumber(r.substring(2))).toString() : -1;
}
function getStartOfV(e, t) {
	return t + (getLenOfL(e, t) + 1) * 2;
}
function encodeDer(e, t) {
	return new DERSequence([new DERInteger(e), new DERInteger(t)]).getEncodedHex();
}
function encodeEnc(e, t, n, r) {
	return new DERSequence([
		new DERInteger(e),
		new DERInteger(t),
		new DEROctetString(n),
		new DEROctetString(r)
	]).getEncodedHex();
}
function decodeDer(e) {
	let t = getStartOfV(e, 0), n = getStartOfV(e, t), r = getL(e, t), i = e.substring(n, n + r * 2), a = n + i.length, o = getStartOfV(e, a), s = getL(e, a), c = e.substring(o, o + s * 2);
	return {
		r: hexToNumber(i),
		s: hexToNumber(c)
	};
}
function decodeEnc(e) {
	function t(e, t) {
		let n = getStartOfV(e, t), r = getL(e, t), i = e.substring(n, n + r * 2);
		return {
			value: i,
			nextStart: n + i.length
		};
	}
	let { value: n, nextStart: r } = t(e, getStartOfV(e, 0)), { value: i, nextStart: a } = t(e, r), { value: o, nextStart: s } = t(e, a), { value: c } = t(e, s);
	return {
		x: hexToNumber(n),
		y: hexToNumber(i),
		hash: o,
		cipher: c
	};
}
var DEFAULT_PRNG_POOL_SIZE = 16384, prngPool = new Uint8Array(), _syncCrypto;
async function initRNGPool() {
	if ("crypto" in globalThis) {
		_syncCrypto = globalThis.crypto;
		return;
	}
	if (!(prngPool.length > DEFAULT_PRNG_POOL_SIZE / 2)) if ("wx" in globalThis && "getRandomValues" in globalThis.wx) prngPool = await new Promise((e) => {
		wx.getRandomValues({
			length: DEFAULT_PRNG_POOL_SIZE,
			success(t) {
				e(new Uint8Array(t.randomValues));
			}
		});
	});
	else try {
		_syncCrypto = globalThis.crypto ? globalThis.crypto : (await import(
			/* webpackIgnore: true */
			"./__vite-browser-external-C_GUUjbx.js"
).then(__toDynamicImportESM(1))).webcrypto;
		let t = new Uint8Array(DEFAULT_PRNG_POOL_SIZE);
		_syncCrypto.getRandomValues(t), prngPool = t;
	} catch {
		throw Error("no available csprng, abort.");
	}
}
initRNGPool();
function consumePool(e) {
	if (prngPool.length > e) {
		let t = prngPool.slice(0, e);
		return prngPool = prngPool.slice(e), initRNGPool(), t;
	} else throw Error("random number pool is not ready or insufficient, prevent getting too long random values or too often.");
}
function randomBytes(e = 0) {
	let t = new Uint8Array(e);
	return _syncCrypto ? _syncCrypto.getRandomValues(t) : consumePool(e);
}
var u8a = (e) => e instanceof Uint8Array, createView$1 = (e) => new DataView(e.buffer, e.byteOffset, e.byteLength);
if (new Uint8Array(new Uint32Array([287454020]).buffer)[0] !== 68) throw Error("Non little-endian hardware is not supported");
var hexes = Array.from({ length: 256 }, (e, t) => t.toString(16).padStart(2, "0"));
function bytesToHex(e) {
	if (!u8a(e)) throw Error("Uint8Array expected");
	let t = "";
	for (let n = 0; n < e.length; n++) t += hexes[e[n]];
	return t;
}
function utf8ToBytes(e) {
	if (typeof e != "string") throw Error(`utf8ToBytes expected string, got ${typeof e}`);
	return new Uint8Array(new TextEncoder().encode(e));
}
function toBytes(e) {
	if (typeof e == "string" && (e = utf8ToBytes(e)), !u8a(e)) throw Error(`expected Uint8Array, got ${typeof e}`);
	return e;
}
var Hash = class {
	clone() {
		return this._cloneInto();
	}
};
function wrapConstructor(e) {
	let t = (t) => e().update(toBytes(t)).digest(), n = e();
	return t.outputLen = n.outputLen, t.blockLen = n.blockLen, t.create = () => e(), t;
}
var BoolA = (e, t, n) => e & t | e & n | t & n, BoolB = (e, t, n) => e ^ t ^ n, BoolC = (e, t, n) => e & t | ~e & n;
function setBigUint64$1(e, t, n, r) {
	if (typeof e.setBigUint64 == "function") return e.setBigUint64(t, n, r);
	let i = BigInt(32), a = BigInt(4294967295), o = Number(n >> i & a), s = Number(n & a), c = r ? 4 : 0, l = r ? 0 : 4;
	e.setUint32(t + c, o, r), e.setUint32(t + l, s, r);
}
function rotl(e, t) {
	let n = t & 31;
	return e << n | e >>> 32 - n;
}
function P0(e) {
	return e ^ rotl(e, 9) ^ rotl(e, 17);
}
function P1(e) {
	return e ^ rotl(e, 15) ^ rotl(e, 23);
}
var SHA2 = class extends Hash {
	constructor(e, t, n, r) {
		super(), this.blockLen = e, this.outputLen = t, this.padOffset = n, this.isLE = r, this.buffer = new Uint8Array(e), this.view = createView$1(this.buffer);
	}
	buffer;
	view;
	finished = !1;
	length = 0;
	pos = 0;
	destroyed = !1;
	update(e) {
		let { view: t, buffer: n, blockLen: r } = this;
		e = toBytes(e);
		let i = e.length;
		for (let a = 0; a < i;) {
			let o = Math.min(r - this.pos, i - a);
			if (o === r) {
				let t = createView$1(e);
				for (; r <= i - a; a += r) this.process(t, a);
				continue;
			}
			n.set(e.subarray(a, a + o), this.pos), this.pos += o, a += o, this.pos === r && (this.process(t, 0), this.pos = 0);
		}
		return this.length += e.length, this.roundClean(), this;
	}
	digestInto(e) {
		this.finished = !0;
		let { buffer: t, view: n, blockLen: r, isLE: i } = this, { pos: a } = this;
		t[a++] = 128, this.buffer.subarray(a).fill(0), this.padOffset > r - a && (this.process(n, 0), a = 0);
		for (let e = a; e < r; e++) t[e] = 0;
		setBigUint64$1(n, r - 8, BigInt(this.length * 8), i), this.process(n, 0);
		let o = createView$1(e), s = this.outputLen;
		if (s % 4) throw Error("_sha2: outputLen should be aligned to 32bit");
		let c = s / 4, l = this.get();
		if (c > l.length) throw Error("_sha2: outputLen bigger than state");
		for (let e = 0; e < c; e++) o.setUint32(4 * e, l[e], i);
	}
	digest() {
		let { buffer: e, outputLen: t } = this;
		this.digestInto(e);
		let n = e.slice(0, t);
		return this.destroy(), n;
	}
	_cloneInto(e) {
		e ||= new this.constructor(), e.set(...this.get());
		let { blockLen: t, buffer: n, length: r, finished: i, destroyed: a, pos: o } = this;
		return e.length = r, e.pos = o, e.finished = i, e.destroyed = a, r % t && e.buffer.set(n), e;
	}
}, IV = new Uint32Array([
	1937774191,
	1226093241,
	388252375,
	3666478592,
	2842636476,
	372324522,
	3817729613,
	2969243214
]), SM3_W = new Uint32Array(68), SM3_M = new Uint32Array(64), T1 = 2043430169, T2 = 2055708042, SM3 = class extends SHA2 {
	A = IV[0] | 0;
	B = IV[1] | 0;
	C = IV[2] | 0;
	D = IV[3] | 0;
	E = IV[4] | 0;
	F = IV[5] | 0;
	G = IV[6] | 0;
	H = IV[7] | 0;
	constructor() {
		super(64, 32, 8, !1);
	}
	get() {
		let { A: e, B: t, C: n, D: r, E: i, F: a, G: o, H: s } = this;
		return [
			e,
			t,
			n,
			r,
			i,
			a,
			o,
			s
		];
	}
	set(e, t, n, r, i, a, o, s) {
		this.A = e | 0, this.B = t | 0, this.C = n | 0, this.D = r | 0, this.E = i | 0, this.F = a | 0, this.G = o | 0, this.H = s | 0;
	}
	process(e, t) {
		for (let n = 0; n < 16; n++, t += 4) SM3_W[n] = e.getUint32(t, !1);
		for (let e = 16; e < 68; e++) SM3_W[e] = P1(SM3_W[e - 16] ^ SM3_W[e - 9] ^ rotl(SM3_W[e - 3], 15)) ^ rotl(SM3_W[e - 13], 7) ^ SM3_W[e - 6];
		for (let e = 0; e < 64; e++) SM3_M[e] = SM3_W[e] ^ SM3_W[e + 4];
		let { A: n, B: r, C: i, D: a, E: o, F: s, G: c, H: l } = this;
		for (let e = 0; e < 64; e++) {
			let t = e >= 0 && e <= 15, u = t ? T1 : T2, d = rotl(rotl(n, 12) + o + rotl(u, e), 7), f = d ^ rotl(n, 12), p = (t ? BoolB(n, r, i) : BoolA(n, r, i)) + a + f + SM3_M[e] | 0, m = (t ? BoolB(o, s, c) : BoolC(o, s, c)) + l + d + SM3_W[e] | 0;
			a = i, i = rotl(r, 9), r = n, n = p, l = c, c = rotl(s, 19), s = o, o = P0(m);
		}
		n = n ^ this.A | 0, r = r ^ this.B | 0, i = i ^ this.C | 0, a = a ^ this.D | 0, o = o ^ this.E | 0, s = s ^ this.F | 0, c = c ^ this.G | 0, l = l ^ this.H | 0, this.set(n, r, i, a, o, s, c, l);
	}
	roundClean() {
		SM3_W.fill(0);
	}
	destroy() {
		this.set(0, 0, 0, 0, 0, 0, 0, 0), this.buffer.fill(0);
	}
}, sm3 = wrapConstructor(() => new SM3()), HMAC = class extends Hash {
	oHash;
	iHash;
	blockLen;
	outputLen;
	finished = !1;
	destroyed = !1;
	constructor(e, t) {
		super();
		let n = toBytes(t);
		if (this.iHash = e.create(), typeof this.iHash.update != "function") throw Error("Expected instance of class which extends utils.Hash");
		this.blockLen = this.iHash.blockLen, this.outputLen = this.iHash.outputLen;
		let r = this.blockLen, i = new Uint8Array(r);
		i.set(n.length > r ? e.create().update(n).digest() : n);
		for (let e = 0; e < i.length; e++) i[e] ^= 54;
		this.iHash.update(i), this.oHash = e.create();
		for (let e = 0; e < i.length; e++) i[e] ^= 106;
		this.oHash.update(i), i.fill(0);
	}
	update(e) {
		return this.iHash.update(e), this;
	}
	digestInto(e) {
		this.finished = !0, this.iHash.digestInto(e), this.oHash.update(e), this.oHash.digestInto(e), this.destroy();
	}
	digest() {
		let e = new Uint8Array(this.oHash.outputLen);
		return this.digestInto(e), e;
	}
	_cloneInto(e) {
		e ||= Object.create(Object.getPrototypeOf(this), {});
		let { oHash: t, iHash: n, finished: r, destroyed: i, blockLen: a, outputLen: o } = this;
		return e = e, e.finished = r, e.destroyed = i, e.blockLen = a, e.outputLen = o, e.oHash = t._cloneInto(e.oHash), e.iHash = n._cloneInto(e.iHash), e;
	}
	destroy() {
		this.destroyed = !0, this.oHash.destroy(), this.iHash.destroy();
	}
}, hmac = (e, t, n) => new HMAC(e, t).update(n).digest();
hmac.create = (e, t) => new HMAC(e, t);
var sm2Fp = Field(BigInt("115792089210356248756420345214020892766250353991924191454421193933289684991999")), sm2Curve = weierstrass({
	a: BigInt("115792089210356248756420345214020892766250353991924191454421193933289684991996"),
	b: BigInt("18505919022281880113072981827955639221458448578012075254857346196103069175443"),
	Fp: sm2Fp,
	h: ONE,
	n: BigInt("115792089210356248756420345214020892766061623724957744567843809356293439045923"),
	Gx: BigInt("22963146547237050559479531362550074578802567295341616970375194840604139615431"),
	Gy: BigInt("85132369209828568825618990617112496413088388631904505083283536607588877201568"),
	hash: sm3,
	hmac: (e, ...t) => hmac(sm3, e, concatBytes(...t)),
	randomBytes
}), field = Field(BigInt(sm2Curve.CURVE.n));
function generateKeyPairHex(e) {
	let t = e ? numberToBytesBE$1(mod(BigInt(e), ONE) + ONE, 32) : sm2Curve.utils.randomPrivateKey(), n = sm2Curve.getPublicKey(t, !1);
	return {
		privateKey: leftPad(bytesToHex$2(t), 64),
		publicKey: leftPad(bytesToHex$2(n), 64)
	};
}
function compressPublicKeyHex(e) {
	if (e.length !== 130) throw Error("Invalid public key to compress");
	let t = (e.length - 2) / 2, n = e.substring(2, 2 + t), r = hexToNumber(e.substring(t + 2, t + t + 2)), i = "03";
	return mod(r, TWO) === ZERO && (i = "02"), i + n;
}
function utf8ToHex(e) {
	return bytesToHex$2(utf8ToBytes$2(e));
}
function leftPad(e, t) {
	return e.length >= t ? e : Array(t - e.length + 1).join("0") + e;
}
function arrayToHex(e) {
	return e.map((e) => {
		let t = e.toString(16);
		return t.length === 1 ? "0" + t : t;
	}).join("");
}
function arrayToUtf8(e) {
	let t = [];
	for (let n = 0, r = e.length; n < r; n++) e[n] >= 240 && e[n] <= 247 ? (t.push(String.fromCodePoint(((e[n] & 7) << 18) + ((e[n + 1] & 63) << 12) + ((e[n + 2] & 63) << 6) + (e[n + 3] & 63))), n += 3) : e[n] >= 224 && e[n] <= 239 ? (t.push(String.fromCodePoint(((e[n] & 15) << 12) + ((e[n + 1] & 63) << 6) + (e[n + 2] & 63))), n += 2) : e[n] >= 192 && e[n] <= 223 ? (t.push(String.fromCodePoint(((e[n] & 31) << 6) + (e[n + 1] & 63))), n++) : t.push(String.fromCodePoint(e[n]));
	return t.join("");
}
function hexToArray(e) {
	let t = e.length;
	t % 2 != 0 && (e = leftPad(e, t + 1)), t = e.length;
	let n = t / 2, r = new Uint8Array(n);
	for (let t = 0; t < n; t++) r[t] = parseInt(e.substring(t * 2, t * 2 + 2), 16);
	return r;
}
function verifyPublicKey(e) {
	let t = sm2Curve.ProjectivePoint.fromHex(e);
	if (!t) return !1;
	try {
		return t.assertValidity(), !0;
	} catch {
		return !1;
	}
}
function comparePublicKeyHex(e, t) {
	let n = sm2Curve.ProjectivePoint.fromHex(e);
	if (!n) return !1;
	let r = sm2Curve.ProjectivePoint.fromHex(t);
	return r ? n.equals(r) : !1;
}
var wPow2 = hexToNumber("80000000000000000000000000000000"), wPow2Sub1 = hexToNumber("7fffffffffffffffffffffffffffffff");
function hkdf(e, t) {
	let n = new Uint8Array(t), r = 1, i = 0, a = EmptyArray, o = new Uint8Array(4), s = () => {
		o[0] = r >> 24 & 255, o[1] = r >> 16 & 255, o[2] = r >> 8 & 255, o[3] = r & 255, a = sm3(concatBytes(e, o)), r++, i = 0;
	};
	s();
	for (let e = 0, t = n.length; e < t; e++) i === a.length && s(), n[e] = a[i++] & 255;
	return n;
}
function calculateSharedKey(e, t, n, r, i, a = !1, o = "1234567812345678", s = "1234567812345678") {
	let c = sm2Curve.ProjectivePoint.fromHex(t.publicKey), l = sm2Curve.ProjectivePoint.fromHex(r), u = sm2Curve.ProjectivePoint.fromHex(n), d = getZ(e.publicKey, o), f = getZ(n, s);
	a && ([d, f] = [f, d]);
	let p = hexToNumber(t.privateKey), m = hexToNumber(e.privateKey), g = wPow2 + (c.x & wPow2Sub1), _ = field.add(m, field.mulN(g, p)), v = l.x, y = field.add(wPow2, v & wPow2Sub1), b = l.multiply(y).add(u).multiply(_);
	return hkdf(concatBytes(hexToArray(leftPad(numberToHexUnpadded$1(b.x), 64)), hexToArray(leftPad(numberToHexUnpadded$1(b.y), 64)), d, f), i);
}
var C1C2C3 = 0, EmptyArray = new Uint8Array();
function doEncrypt(e, t, n = 1, r) {
	let i = typeof e == "string" ? hexToArray(utf8ToHex(e)) : Uint8Array.from(e), a = typeof t == "string" ? sm2Curve.ProjectivePoint.fromHex(t) : t, o = generateKeyPairHex(), s = hexToNumber(o.privateKey), c = o.publicKey;
	c.length > 128 && (c = c.substring(c.length - 128));
	let l = a.multiply(s), u = hexToArray(leftPad(numberToHexUnpadded$1(l.x), 64)), d = hexToArray(leftPad(numberToHexUnpadded$1(l.y), 64)), f = bytesToHex(sm3(concatBytes(u, i, d)));
	xorCipherStream(u, d, i);
	let p = bytesToHex(i);
	if (r?.asn1) {
		let e = sm2Curve.ProjectivePoint.fromHex(o.publicKey);
		return n === C1C2C3 ? encodeEnc(e.x, e.y, p, f) : encodeEnc(e.x, e.y, f, p);
	}
	return n === C1C2C3 ? c + p + f : c + f + p;
}
function xorCipherStream(e, t, n) {
	let r = 1, i = 0, a = EmptyArray, o = new Uint8Array(4), s = () => {
		o[0] = r >> 24 & 255, o[1] = r >> 16 & 255, o[2] = r >> 8 & 255, o[3] = r & 255, a = sm3(concatBytes(e, t, o)), r++, i = 0;
	};
	s();
	for (let e = 0, t = n.length; e < t; e++) i === a.length && s(), n[e] ^= a[i++] & 255;
}
function doDecrypt(e, t, n = 1, { output: r = "string", asn1: i = !1 } = {}) {
	let a = hexToNumber(t), o, s, c;
	if (i) {
		let { x: t, y: r, cipher: i, hash: a } = decodeEnc(e);
		o = sm2Curve.ProjectivePoint.fromAffine({
			x: t,
			y: r
		}), c = a, s = i, n === C1C2C3 && ([s, c] = [c, s]);
	} else o = sm2Curve.ProjectivePoint.fromHex("04" + e.substring(0, 128)), c = e.substring(128, 192), s = e.substring(192), n === C1C2C3 && (c = e.substring(e.length - 64), s = e.substring(128, e.length - 64));
	let l = hexToArray(s), u = o.multiply(a), d = hexToArray(leftPad(numberToHexUnpadded$1(u.x), 64)), f = hexToArray(leftPad(numberToHexUnpadded$1(u.y), 64));
	return xorCipherStream(d, f, l), arrayToHex(Array.from(sm3(concatBytes(d, l, f)))) === c.toLowerCase() ? r === "array" ? l : arrayToUtf8(l) : r === "array" ? [] : "";
}
function doSignature(e, t, n = {}) {
	let { pointPool: r, der: i, hash: a, publicKey: o, userId: s } = n, c = typeof e == "string" ? utf8ToHex(e) : arrayToHex(Array.from(e));
	a && (o ||= getPublicKeyFromPrivateKey(t), c = getHash(c, o, s));
	let l = hexToNumber(t), u = hexToNumber(c), d = null, f = null, p = null;
	do {
		do {
			let e;
			e = r && r.length ? r.pop() : getPoint(), d = e.k, f = field.add(u, e.x1);
		} while (f === ZERO || f + d === sm2Curve.CURVE.n);
		p = field.mul(field.inv(field.addN(l, ONE)), field.subN(d, field.mulN(f, l)));
	} while (p === ZERO);
	return i ? encodeDer(f, p) : leftPad(numberToHexUnpadded$1(f), 64) + leftPad(numberToHexUnpadded$1(p), 64);
}
function doVerifySignature(e, t, n, r = {}) {
	let i, { hash: a, der: o, userId: s } = r, c = typeof n == "string" ? n : n.toHex(!1);
	i = a ? getHash(typeof e == "string" ? utf8ToHex(e) : e, c, s) : typeof e == "string" ? utf8ToHex(e) : arrayToHex(Array.from(e));
	let l, u;
	if (o) {
		let e = decodeDer(t);
		l = e.r, u = e.s;
	} else l = hexToNumber(t.substring(0, 64)), u = hexToNumber(t.substring(64));
	let d = typeof n == "string" ? sm2Curve.ProjectivePoint.fromHex(n) : n, f = hexToNumber(i), p = field.add(l, u);
	if (p === ZERO) return !1;
	let m = sm2Curve.ProjectivePoint.BASE.multiply(u).add(d.multiply(p)), g = field.add(f, m.x);
	return l === g;
}
function getZ(e, t = "1234567812345678") {
	t = utf8ToHex(t);
	let n = leftPad(numberToHexUnpadded$1(sm2Curve.CURVE.a), 64), r = leftPad(numberToHexUnpadded$1(sm2Curve.CURVE.b), 64), i = leftPad(numberToHexUnpadded$1(sm2Curve.ProjectivePoint.BASE.x), 64), a = leftPad(numberToHexUnpadded$1(sm2Curve.ProjectivePoint.BASE.y), 64), o, s;
	if (e.length === 128) o = e.substring(0, 64), s = e.substring(64, 128);
	else {
		let t = sm2Curve.ProjectivePoint.fromHex(e);
		o = leftPad(numberToHexUnpadded$1(t.x), 64), s = leftPad(numberToHexUnpadded$1(t.y), 64);
	}
	let c = hexToArray(t + n + r + i + a + o + s), l = t.length * 4;
	return sm3(concatBytes(new Uint8Array([l >> 8 & 255, l & 255]), c));
}
function getHash(e, t, n = "1234567812345678") {
	return bytesToHex(sm3(concatBytes(getZ(t, n), typeof e == "string" ? hexToArray(e) : e)));
}
function precomputePublicKey(e, t) {
	let n = sm2Curve.ProjectivePoint.fromHex(e);
	return sm2Curve.utils.precompute(t, n);
}
function getPublicKeyFromPrivateKey(e) {
	return leftPad(bytesToHex$2(sm2Curve.getPublicKey(e, !1)), 64);
}
function getPoint() {
	let e = generateKeyPairHex(), t = sm2Curve.ProjectivePoint.fromHex(e.publicKey), n = hexToNumber(e.privateKey);
	return {
		...e,
		k: n,
		x1: t.x
	};
}
function utf8ToArray(e) {
	let t = [];
	for (let n = 0, r = e.length; n < r; n++) {
		let r = e.codePointAt(n);
		if (r <= 127) t.push(r);
		else if (r <= 2047) t.push(192 | r >>> 6), t.push(128 | r & 63);
		else if (r <= 55295 || r >= 57344 && r <= 65535) t.push(224 | r >>> 12), t.push(128 | r >>> 6 & 63), t.push(128 | r & 63);
		else if (r >= 65536 && r <= 1114111) n++, t.push(240 | r >>> 18 & 28), t.push(128 | r >>> 12 & 63), t.push(128 | r >>> 6 & 63), t.push(128 | r & 63);
		else throw t.push(r), Error("input is not supported");
	}
	return new Uint8Array(t);
}
function sm32(e, t) {
	if (e = typeof e == "string" ? utf8ToArray(e) : e, t) {
		if ((t.mode || "hmac") !== "hmac") throw Error("invalid mode");
		let n = t.key;
		if (!n) throw Error("invalid key");
		return n = typeof n == "string" ? hexToArray(n) : n, bytesToHex(hmac(sm3, n, e));
	}
	return bytesToHex(sm3(e));
}
var sm4_exports = {};
__export(sm4_exports, {
	decrypt: () => decrypt,
	encrypt: () => encrypt,
	sm4: () => sm4
});
var DECRYPT = 0, ROUND = 32, BLOCK = 16, Sbox = Uint8Array.from([
	214,
	144,
	233,
	254,
	204,
	225,
	61,
	183,
	22,
	182,
	20,
	194,
	40,
	251,
	44,
	5,
	43,
	103,
	154,
	118,
	42,
	190,
	4,
	195,
	170,
	68,
	19,
	38,
	73,
	134,
	6,
	153,
	156,
	66,
	80,
	244,
	145,
	239,
	152,
	122,
	51,
	84,
	11,
	67,
	237,
	207,
	172,
	98,
	228,
	179,
	28,
	169,
	201,
	8,
	232,
	149,
	128,
	223,
	148,
	250,
	117,
	143,
	63,
	166,
	71,
	7,
	167,
	252,
	243,
	115,
	23,
	186,
	131,
	89,
	60,
	25,
	230,
	133,
	79,
	168,
	104,
	107,
	129,
	178,
	113,
	100,
	218,
	139,
	248,
	235,
	15,
	75,
	112,
	86,
	157,
	53,
	30,
	36,
	14,
	94,
	99,
	88,
	209,
	162,
	37,
	34,
	124,
	59,
	1,
	33,
	120,
	135,
	212,
	0,
	70,
	87,
	159,
	211,
	39,
	82,
	76,
	54,
	2,
	231,
	160,
	196,
	200,
	158,
	234,
	191,
	138,
	210,
	64,
	199,
	56,
	181,
	163,
	247,
	242,
	206,
	249,
	97,
	21,
	161,
	224,
	174,
	93,
	164,
	155,
	52,
	26,
	85,
	173,
	147,
	50,
	48,
	245,
	140,
	177,
	227,
	29,
	246,
	226,
	46,
	130,
	102,
	202,
	96,
	192,
	41,
	35,
	171,
	13,
	83,
	78,
	111,
	213,
	219,
	55,
	69,
	222,
	253,
	142,
	47,
	3,
	255,
	106,
	114,
	109,
	108,
	91,
	81,
	141,
	27,
	175,
	146,
	187,
	221,
	188,
	127,
	17,
	217,
	92,
	65,
	31,
	16,
	90,
	216,
	10,
	193,
	49,
	136,
	165,
	205,
	123,
	189,
	45,
	116,
	208,
	18,
	184,
	229,
	180,
	176,
	137,
	105,
	151,
	74,
	12,
	150,
	119,
	126,
	101,
	185,
	241,
	9,
	197,
	110,
	198,
	132,
	24,
	240,
	125,
	236,
	58,
	220,
	77,
	32,
	121,
	238,
	95,
	62,
	215,
	203,
	57,
	72
]), CK = new Uint32Array([
	462357,
	472066609,
	943670861,
	1415275113,
	1886879365,
	2358483617,
	2830087869,
	3301692121,
	3773296373,
	4228057617,
	404694573,
	876298825,
	1347903077,
	1819507329,
	2291111581,
	2762715833,
	3234320085,
	3705924337,
	4177462797,
	337322537,
	808926789,
	1280531041,
	1752135293,
	2223739545,
	2695343797,
	3166948049,
	3638552301,
	4110090761,
	269950501,
	741554753,
	1213159005,
	1684763257
]);
function byteSub(e) {
	return (Sbox[e >>> 24 & 255] & 255) << 24 | (Sbox[e >>> 16 & 255] & 255) << 16 | (Sbox[e >>> 8 & 255] & 255) << 8 | Sbox[e & 255] & 255;
}
new Uint32Array(4), new Uint32Array(4);
function sms4Crypt(e, t, n) {
	let r = 0, i = 0, a = 0, o = 0, s = 0, c = 0, l = 0, u = 0;
	s = e[0] & 255, c = e[1] & 255, l = e[2] & 255, u = e[3] & 255, r = s << 24 | c << 16 | l << 8 | u, s = e[4] & 255, c = e[5] & 255, l = e[6] & 255, u = e[7] & 255, i = s << 24 | c << 16 | l << 8 | u, s = e[8] & 255, c = e[9] & 255, l = e[10] & 255, u = e[11] & 255, a = s << 24 | c << 16 | l << 8 | u, s = e[12] & 255, c = e[13] & 255, l = e[14] & 255, u = e[15] & 255, o = s << 24 | c << 16 | l << 8 | u;
	for (let e = 0; e < 32; e += 4) s = i ^ a ^ o ^ n[e], s = byteSub(s), r ^= s ^ (s << 2 | s >>> 30) ^ (s << 10 | s >>> 22) ^ (s << 18 | s >>> 14) ^ (s << 24 | s >>> 8), c = a ^ o ^ r ^ n[e + 1], c = byteSub(c), i ^= c ^ (c << 2 | c >>> 30) ^ (c << 10 | c >>> 22) ^ (c << 18 | c >>> 14) ^ (c << 24 | c >>> 8), l = o ^ r ^ i ^ n[e + 2], l = byteSub(l), a ^= l ^ (l << 2 | l >>> 30) ^ (l << 10 | l >>> 22) ^ (l << 18 | l >>> 14) ^ (l << 24 | l >>> 8), u = r ^ i ^ a ^ n[e + 3], u = byteSub(u), o ^= u ^ (u << 2 | u >>> 30) ^ (u << 10 | u >>> 22) ^ (u << 18 | u >>> 14) ^ (u << 24 | u >>> 8);
	t[0] = o >>> 24 & 255, t[1] = o >>> 16 & 255, t[2] = o >>> 8 & 255, t[3] = o & 255, t[4] = a >>> 24 & 255, t[5] = a >>> 16 & 255, t[6] = a >>> 8 & 255, t[7] = a & 255, t[8] = i >>> 24 & 255, t[9] = i >>> 16 & 255, t[10] = i >>> 8 & 255, t[11] = i & 255, t[12] = r >>> 24 & 255, t[13] = r >>> 16 & 255, t[14] = r >>> 8 & 255, t[15] = r & 255;
}
function sms4KeyExt(e, t, n) {
	let r = 0, i = 0, a = 0, o = 0, s = 0;
	r = (e[0] & 255) << 24 | (e[1] & 255) << 16 | (e[2] & 255) << 8 | e[3] & 255, i = (e[4] & 255) << 24 | (e[5] & 255) << 16 | (e[6] & 255) << 8 | e[7] & 255, a = (e[8] & 255) << 24 | (e[9] & 255) << 16 | (e[10] & 255) << 8 | e[11] & 255, o = (e[12] & 255) << 24 | (e[13] & 255) << 16 | (e[14] & 255) << 8 | e[15] & 255, r ^= 2746333894, i ^= 1453994832, a ^= 1736282519, o ^= 2993693404;
	for (let e = 0; e < 32; e += 4) s = i ^ a ^ o ^ CK[e + 0], s = byteSub(s), r ^= s ^ (s << 13 | s >>> 19) ^ (s << 23 | s >>> 9), t[e + 0] = r, s = a ^ o ^ r ^ CK[e + 1], s = byteSub(s), i ^= s ^ (s << 13 | s >>> 19) ^ (s << 23 | s >>> 9), t[e + 1] = i, s = o ^ r ^ i ^ CK[e + 2], s = byteSub(s), a ^= s ^ (s << 13 | s >>> 19) ^ (s << 23 | s >>> 9), t[e + 2] = a, s = r ^ i ^ a ^ CK[e + 3], s = byteSub(s), o ^= s ^ (s << 13 | s >>> 19) ^ (s << 23 | s >>> 9), t[e + 3] = o;
	if (n === DECRYPT) for (let e = 0; e < 16; e++) [t[e], t[31 - e]] = [t[31 - e], t[e]];
}
function incrementCounter(e) {
	for (let t = e.length - 1; t >= 0 && (e[t]++, e[t] === 0); t--);
}
function sm4Gcm(e, t, n, r, i, a) {
	function o() {
		let e = new Uint32Array(ROUND);
		sms4KeyExt(t, e, 1);
		let r = new Uint8Array(16).fill(0), i = new Uint8Array(16);
		sms4Crypt(r, i, e);
		let a;
		if (n.length === 12) a = new Uint8Array(16), a.set(n, 0), a[15] = 1;
		else {
			let e = ghash.create(i);
			e.update(n);
			let t = new Uint8Array(16);
			setBigUint64(createView(t), 8, BigInt(n.length * 8), !1), e.update(t), a = e.digest();
		}
		let o = new Uint8Array(a);
		incrementCounter(o);
		let s = new Uint8Array(16);
		return sms4Crypt(a, s, e), {
			roundKey: e,
			h: i,
			j0: a,
			counter: o,
			tagMask: s
		};
	}
	function s(e, t) {
		let n = r.length, i = t.length, a = ghash.create(e);
		n > 0 && a.update(r), a.update(t);
		let o = new Uint8Array(16), s = createView(o);
		return setBigUint64(s, 0, BigInt(n * 8), !1), setBigUint64(s, 8, BigInt(i * 8), !1), a.update(o), a.digest();
	}
	let { roundKey: c, h: l, j0: u, counter: d, tagMask: f } = o();
	if (i === DECRYPT && a) {
		let t = s(l, e);
		for (let e = 0; e < 16; e++) t[e] ^= f[e];
		let n = 0;
		for (let e = 0; e < 16; e++) n |= t[e] ^ a[e];
		if (n !== 0) throw Error("authentication tag mismatch");
	}
	let p = new Uint8Array(e.length), m = 0, g = e.length;
	for (; g >= BLOCK;) {
		let t = new Uint8Array(BLOCK);
		sms4Crypt(d, t, c);
		for (let n = 0; n < BLOCK && n < g; n++) p[m + n] = e[m + n] ^ t[n];
		incrementCounter(d), m += BLOCK, g -= BLOCK;
	}
	if (g > 0) {
		let t = new Uint8Array(BLOCK);
		sms4Crypt(d, t, c);
		for (let n = 0; n < g; n++) p[m + n] = e[m + n] ^ t[n];
	}
	if (i !== DECRYPT) {
		let e = s(l, p);
		for (let t = 0; t < 16; t++) e[t] ^= f[t];
		return {
			output: p,
			tag: e
		};
	}
	return { output: p };
}
var blockOutput = new Uint8Array(16);
function sm4(e, t, n, r = {}) {
	let { padding: i = "pkcs#7", mode: a, iv: o = new Uint8Array(16), output: s, associatedData: c, outputTag: l, tag: u } = r;
	if (a === "gcm") {
		let r = typeof t == "string" ? hexToArray(t) : Uint8Array.from(t), i = typeof o == "string" ? hexToArray(o) : Uint8Array.from(o), a = c ? typeof c == "string" ? hexToArray(c) : Uint8Array.from(c) : new Uint8Array(), d;
		d = typeof e == "string" ? n === DECRYPT ? hexToArray(e) : utf8ToArray(e) : Uint8Array.from(e);
		let f = u ? typeof u == "string" ? hexToArray(u) : Uint8Array.from(u) : void 0, p = sm4Gcm(d, r, i, a, n, f);
		return s === "array" ? l && n !== DECRYPT ? p : p.output : l && n !== DECRYPT || n !== DECRYPT ? {
			output: bytesToHex(p.output),
			tag: p.tag ? bytesToHex(p.tag) : void 0
		} : arrayToUtf8(p.output);
	}
	if (a === "cbc" && (typeof o == "string" && (o = hexToArray(o)), o.length !== 128 / 8)) throw Error("iv is invalid");
	if (typeof t == "string" && (t = hexToArray(t)), t.length !== 128 / 8) throw Error("key is invalid");
	if (e = typeof e == "string" ? n === DECRYPT ? hexToArray(e) : utf8ToArray(e) : Uint8Array.from(e), (i === "pkcs#5" || i === "pkcs#7") && n !== DECRYPT) {
		let t = BLOCK - e.length % BLOCK, n = new Uint8Array(e.length + t);
		n.set(e, 0);
		for (let r = 0; r < t; r++) n[e.length + r] = t;
		e = n;
	}
	let d = new Uint32Array(ROUND);
	sms4KeyExt(t, d, n);
	let f = new Uint8Array(e.length), p = o, m = e.length, g = 0;
	for (; m >= BLOCK;) {
		let t = e.subarray(g, g + 16);
		if (a === "cbc") for (let e = 0; e < BLOCK; e++) n !== DECRYPT && (t[e] ^= p[e]);
		sms4Crypt(t, blockOutput, d);
		for (let e = 0; e < BLOCK; e++) a === "cbc" && n === DECRYPT && (blockOutput[e] ^= p[e]), f[g + e] = blockOutput[e];
		a === "cbc" && (p = n === DECRYPT ? t : blockOutput), m -= BLOCK, g += BLOCK;
	}
	if ((i === "pkcs#5" || i === "pkcs#7") && n === DECRYPT) {
		let e = f.length, t = f[e - 1];
		for (let n = 1; n <= t; n++) if (f[e - n] !== t) throw Error("padding is invalid");
		f = f.slice(0, e - t);
	}
	return s === "array" ? f : n === DECRYPT ? arrayToUtf8(f) : bytesToHex(f);
}
function encrypt(e, t, n = {}) {
	return sm4(e, t, 1, n);
}
function decrypt(e, t, n = {}) {
	return sm4(e, t, 0, n);
}
function useSm2() {
	return sm2_exports;
}
function useSm3(e, t) {
	return sm32(e, t);
}
function useSm4Encrypt(e, t, n) {
	return sm4_exports.encrypt(e, t, n);
}
function useSm4Decrypt(e, t, n) {
	return sm4_exports.encrypt(e, t, n);
}
function useDayjs(e, t) {
	return e && /^\d+$/.test(e) && String(e).length <= 10 && (e = parseInt(`${e}000`)), t ? dayjs(e, t) : dayjs(e);
}
function useDateFormat(e, t) {
	return e ? (dayjs.isDayjs(e) || (e = useDayjs(e)), e.format(t || "YYYY-MM-DD HH:mm")) : "";
}
function useDateUnix(e) {
	return e ? (dayjs.isDayjs(e) || (e = useDayjs(e)), e.unix()) : "";
}
const STATUS = {
	STATE_CODE_SUCCESS: "SUCCESS",
	STATE_CODE_FAIL: "FAIL",
	STATE_CODE_NOT_FOUND: "NOT_FOUND",
	STATE_CODE_INFO_NOT_COMPLETE: "INCOMPLETE",
	STATE_CODE_NOT_ALLOWED: "NOT_ALLOWED"
};
function _configStatus(e) {
	Object.keys(e).forEach((t) => {
		STATUS[t] = e[t];
	});
}
function useFetch(e) {
	return e ||= {}, e.loading = !0, {
		get(t, n) {
			return new Promise((r, i) => {
				axios.get(t, n).then((e) => {
					r(e);
				}).catch((e) => {
					i(e);
				}).finally(() => {
					e.loading = !1;
				});
			});
		},
		post(t, n, r) {
			return new Promise((i, a) => {
				axios.post(t, n, r).then((e) => {
					i(e);
				}).catch((e) => {
					a(e);
				}).finally(() => {
					e.loading = !1;
				});
			});
		}
	};
}
async function usePage(e, t, n) {
	if (e.finishedText = e.finishedText || "加载完毕", e.loading = !0, !e.uri) return console.error("URI is required in pagination"), e;
	let r = {};
	try {
		r = await axios.get(e.uri, { params: {
			...e.params || {},
			page: t || !e.page ? 1 : e.page + 1
		} });
	} catch {
		return e.loading = !1, e.finished = !1, e.error = !0, e;
	}
	if (r.status !== STATUS.STATE_CODE_SUCCESS) return e.loading = !1, e.error = !0, e.errorText = r.result, e;
	let i;
	i = n ? n(r) : r.result;
	let a = i.data;
	!t && e.items && (a = e.items.concat(a));
	let o = i.current_page || i.current || i.page || 1, s = i.last_page || i.lastPage || i.pages || 0, c = i.total_size || i.totalSize || i.total || 0;
	return e.loading = !1, e.error = !1, e.page = o, e.items = a, e.finished = s === 0 || s === o, e.empty = c === 0, e;
}
var { STATE_CODE_FAIL, STATE_CODE_INFO_NOT_COMPLETE, STATE_CODE_NOT_FOUND, STATE_CODE_NOT_ALLOWED, STATE_CODE_SUCCESS } = STATUS;
function useHiddenForm(e) {
	let { url: t, csrfToken: n } = e, { method: r, data: i } = e;
	r ||= "post", i ||= {};
	let a = document.createElement("form");
	if (a.action = t, a.method = r, a.target = "_blank", a.style.display = "none", Object.keys(i).forEach((e) => {
		let t = document.createElement("input");
		t.type = "hidden", t.name = e, t.value = i[e], a.appendChild(t);
	}), !n) {
		let e = document.createElement("input");
		e.type = "hidden", e.name = "_token", e.value = document.querySelector("meta[name=\"csrf-token\"]")?.getAttribute("content"), a.appendChild(e);
	}
	return document.body.appendChild(a), a;
}
function useProcessStatus(e, t) {
	let { status: n } = e, r = e.result, i = {};
	i.default = "请求失败, 请检查数据并重试", i[STATE_CODE_FAIL] = "系统错误，请稍候再试", i[STATE_CODE_NOT_FOUND] = "请求的内容不存在", i[STATE_CODE_INFO_NOT_COMPLETE] = "信息不完整", i[STATE_CODE_NOT_ALLOWED] = "没有权限";
	let a = { [STATE_CODE_SUCCESS]: "success" }, o = t[n] || t[a[n]] || i[n] || i.def;
	isString(o) ? n === STATE_CODE_SUCCESS ? message.success(o) : message.error(r || o) : isFunction(o) && o();
}
function useProcessStatusSuccess(e, t) {
	useProcessStatus(e, { success: t });
}
function useFormFail(e) {
	e && e.errorFields ? e.errorFields.forEach((e) => {
		message.error(e.errors.join(" "));
	}) : e && e.response || message.error("请检查填写项");
}
const formLabel = {
	commonLabelCol: {
		span: 8,
		xxl: 6
	},
	commonWrapperCol: {
		span: 12,
		xxl: 14
	},
	commonWrapperOffset: {
		xs: {
			offset: 8,
			span: 12
		},
		xxl: {
			offset: 6,
			span: 14
		}
	},
	commonLabelFullCol: {
		span: 8,
		xxl: 6
	},
	commonWrapperFullCol: {
		span: 16,
		xxl: 18
	},
	commonWrapperFullOffset: {
		xs: {
			offset: 8,
			span: 16
		},
		xxl: {
			offset: 6,
			span: 18
		}
	},
	commonLabelPartCol: {
		span: 4,
		xxl: 3
	},
	commonWrapperPartCol: {
		span: 20,
		xxl: 21
	},
	commonWrapperPartOffset: {
		xs: {
			offset: 4,
			span: 20
		},
		xxl: {
			offset: 3,
			span: 21
		}
	}
};
function useFormFormat(e, t) {
	let n = cloneDeep(e);
	t ||= {};
	let r = (e) => {
		for (let n in e) {
			let i;
			if (dayjs.isDayjs(e[n]) ? i = e[n] : Object.prototype.toString.call(e[n]) === "[object Date]" && (i = dayjs(e[n])), i && t.date) {
				isString(t.date) ? e[n] = i.format(t.date) : isFunction(t.date) ? e[n] = t.date(i) : e[n] = e[n].unix();
				continue;
			}
			if (isBoolean(e[n]) && t.boolean) {
				t.boolean === !0 ? e[n] = e[n] ? 1 : 0 : Array.isArray(t.boolean) && (e[n] = e[n] ? t.boolean?.[0] || 1 : t.boolean?.[1] || 0);
				continue;
			}
			if (t.attachment) {
				let r = t.attachment;
				if (isObject(e[n]) && e[n]._type === "file" && isString(r) && !isUndefined(e[n][r])) {
					e[n] = e[n][r];
					continue;
				} else if (isObject(e[n]) && e[n]._type === "file" && isFunction(r)) {
					e[n] = r(e[n]);
					continue;
				}
			}
			isArray(e[n]) && (e[n] = r(e[n]));
		}
		return e;
	};
	return r(n);
}
function warn(e, t) {
	typeof console < "u" && (console.warn("[intlify] " + e), t && console.warn(t.stack));
}
var hasWarned = {};
function warnOnce(e) {
	hasWarned[e] || (hasWarned[e] = !0, warn(e));
}
var inBrowser = typeof window < "u", mark, measure;
if (process.env.NODE_ENV !== "production") {
	let e = inBrowser && window.performance;
	e && e.mark && e.measure && e.clearMarks && e.clearMeasures && (mark = (t) => {
		e.mark(t);
	}, measure = (t, n, r) => {
		e.measure(t, n, r), e.clearMarks(n), e.clearMarks(r);
	});
}
var RE_ARGS = /\{([0-9a-zA-Z]+)\}/g;
function format(e, ...t) {
	return t.length === 1 && isObject$1(t[0]) && (t = t[0]), (!t || !t.hasOwnProperty) && (t = {}), e.replace(RE_ARGS, (e, n) => t.hasOwnProperty(n) ? t[n] : "");
}
var makeSymbol = (e, t = !1) => t ? Symbol.for(e) : Symbol(e), generateFormatCacheKey = (e, t, n) => friendlyJSONstringify({
	l: e,
	k: t,
	s: n
}), friendlyJSONstringify = (e) => JSON.stringify(e).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029").replace(/\u0027/g, "\\u0027"), isNumber$1 = (e) => typeof e == "number" && isFinite(e), isDate = (e) => toTypeString(e) === "[object Date]", isRegExp = (e) => toTypeString(e) === "[object RegExp]", isEmptyObject = (e) => isPlainObject(e) && Object.keys(e).length === 0, assign = Object.assign, _create = Object.create, create = (e = null) => _create(e), _globalThis, getGlobalThis = () => _globalThis ||= typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : create();
function escapeHtml(e) {
	return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;").replace(/\//g, "&#x2F;").replace(/=/g, "&#x3D;");
}
function escapeAttributeValue(e) {
	return e.replace(/&(?![a-zA-Z0-9#]{2,6};)/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&apos;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function sanitizeTranslatedHtml(e) {
	return e = e.replace(/(\w+)\s*=\s*"([^"]*)"/g, (e, t, n) => `${t}="${escapeAttributeValue(n)}"`), e = e.replace(/(\w+)\s*=\s*'([^']*)'/g, (e, t, n) => `${t}='${escapeAttributeValue(n)}'`), /\s*on\w+\s*=\s*["']?[^"'>]+["']?/gi.test(e) && (process.env.NODE_ENV !== "production" && warn("Potentially dangerous event handlers detected in translation. Consider removing onclick, onerror, etc. from your translation messages."), e = e.replace(/(\s+)(on)(\w+\s*=)/gi, "$1&#111;n$3")), [/(\s+(?:href|src|action|formaction)\s*=\s*["']?)\s*javascript:/gi, /(style\s*=\s*["'][^"']*url\s*\(\s*)javascript:/gi].forEach((t) => {
		e = e.replace(t, "$1javascript&#58;");
	}), e;
}
var hasOwnProperty = Object.prototype.hasOwnProperty;
function hasOwn(e, t) {
	return hasOwnProperty.call(e, t);
}
var isArray$1 = Array.isArray, isFunction$1 = (e) => typeof e == "function", isString$1 = (e) => typeof e == "string", isBoolean$1 = (e) => typeof e == "boolean", isObject$1 = (e) => typeof e == "object" && !!e, isPromise = (e) => isObject$1(e) && isFunction$1(e.then) && isFunction$1(e.catch), objectToString = Object.prototype.toString, toTypeString = (e) => objectToString.call(e), isPlainObject = (e) => toTypeString(e) === "[object Object]", toDisplayString = (e) => e == null ? "" : isArray$1(e) || isPlainObject(e) && e.toString === objectToString ? JSON.stringify(e, null, 2) : String(e);
function join(e, t = "") {
	return e.reduce((e, n, r) => r === 0 ? e + n : e + t + n, "");
}
var RANGE = 2;
function generateCodeFrame(e, t = 0, n = e.length) {
	let r = e.split(/\r?\n/), i = 0, a = [];
	for (let e = 0; e < r.length; e++) if (i += r[e].length + 1, i >= t) {
		for (let o = e - RANGE; o <= e + RANGE || n > i; o++) {
			if (o < 0 || o >= r.length) continue;
			let s = o + 1;
			a.push(`${s}${" ".repeat(3 - String(s).length)}|  ${r[o]}`);
			let c = r[o].length;
			if (o === e) {
				let e = t - (i - c) + 1, r = Math.max(1, n > i ? c - e : n - t);
				a.push("   |  " + " ".repeat(e) + "^".repeat(r));
			} else if (o > e) {
				if (n > i) {
					let e = Math.max(Math.min(n - i, c), 1);
					a.push("   |  " + "^".repeat(e));
				}
				i += c + 1;
			}
		}
		break;
	}
	return a.join("\n");
}
function createEmitter() {
	let e = /* @__PURE__ */ new Map();
	return {
		events: e,
		on(t, n) {
			let r = e.get(t);
			r && r.push(n) || e.set(t, [n]);
		},
		off(t, n) {
			let r = e.get(t);
			r && r.splice(r.indexOf(n) >>> 0, 1);
		},
		emit(t, n) {
			(e.get(t) || []).slice().map((e) => e(n)), (e.get("*") || []).slice().map((e) => e(t, n));
		}
	};
}
var isNotObjectOrIsArray = (e) => !isObject$1(e) || isArray$1(e);
function deepCopy(e, t) {
	if (isNotObjectOrIsArray(e) || isNotObjectOrIsArray(t)) throw Error("Invalid value");
	let n = [{
		src: e,
		des: t
	}];
	for (; n.length;) {
		let { src: e, des: t } = n.pop();
		Object.keys(e).forEach((r) => {
			r !== "__proto__" && (isObject$1(e[r]) && !isObject$1(t[r]) && (t[r] = Array.isArray(e[r]) ? [] : create()), isNotObjectOrIsArray(t[r]) || isNotObjectOrIsArray(e[r]) ? t[r] = e[r] : n.push({
				src: e[r],
				des: t[r]
			}));
		});
	}
}
function createPosition(e, t, n) {
	return {
		line: e,
		column: t,
		offset: n
	};
}
function createLocation(e, t, n) {
	let r = {
		start: e,
		end: t
	};
	return n != null && (r.source = n), r;
}
var CompileErrorCodes = {
	EXPECTED_TOKEN: 1,
	INVALID_TOKEN_IN_PLACEHOLDER: 2,
	UNTERMINATED_SINGLE_QUOTE_IN_PLACEHOLDER: 3,
	UNKNOWN_ESCAPE_SEQUENCE: 4,
	INVALID_UNICODE_ESCAPE_SEQUENCE: 5,
	UNBALANCED_CLOSING_BRACE: 6,
	UNTERMINATED_CLOSING_BRACE: 7,
	EMPTY_PLACEHOLDER: 8,
	NOT_ALLOW_NEST_PLACEHOLDER: 9,
	INVALID_LINKED_FORMAT: 10,
	MUST_HAVE_MESSAGES_IN_PLURAL: 11,
	UNEXPECTED_EMPTY_LINKED_MODIFIER: 12,
	UNEXPECTED_EMPTY_LINKED_KEY: 13,
	UNEXPECTED_LEXICAL_ANALYSIS: 14,
	UNHANDLED_CODEGEN_NODE_TYPE: 15,
	UNHANDLED_MINIFIER_NODE_TYPE: 16
}, errorMessages$2 = {
	[CompileErrorCodes.EXPECTED_TOKEN]: "Expected token: '{0}'",
	[CompileErrorCodes.INVALID_TOKEN_IN_PLACEHOLDER]: "Invalid token in placeholder: '{0}'",
	[CompileErrorCodes.UNTERMINATED_SINGLE_QUOTE_IN_PLACEHOLDER]: "Unterminated single quote in placeholder",
	[CompileErrorCodes.UNKNOWN_ESCAPE_SEQUENCE]: "Unknown escape sequence: \\{0}",
	[CompileErrorCodes.INVALID_UNICODE_ESCAPE_SEQUENCE]: "Invalid unicode escape sequence: {0}",
	[CompileErrorCodes.UNBALANCED_CLOSING_BRACE]: "Unbalanced closing brace",
	[CompileErrorCodes.UNTERMINATED_CLOSING_BRACE]: "Unterminated closing brace",
	[CompileErrorCodes.EMPTY_PLACEHOLDER]: "Empty placeholder",
	[CompileErrorCodes.NOT_ALLOW_NEST_PLACEHOLDER]: "Not allowed nest placeholder",
	[CompileErrorCodes.INVALID_LINKED_FORMAT]: "Invalid linked format",
	[CompileErrorCodes.MUST_HAVE_MESSAGES_IN_PLURAL]: "Plural must have messages",
	[CompileErrorCodes.UNEXPECTED_EMPTY_LINKED_MODIFIER]: "Unexpected empty linked modifier",
	[CompileErrorCodes.UNEXPECTED_EMPTY_LINKED_KEY]: "Unexpected empty linked key",
	[CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS]: "Unexpected lexical analysis in token: '{0}'",
	[CompileErrorCodes.UNHANDLED_CODEGEN_NODE_TYPE]: "unhandled codegen node type: '{0}'",
	[CompileErrorCodes.UNHANDLED_MINIFIER_NODE_TYPE]: "unhandled mimifier node type: '{0}'"
};
function createCompileError(e, t, n = {}) {
	let { domain: r, messages: i, args: a } = n, o = process.env.NODE_ENV === "production" ? e : format((i || errorMessages$2)[e] || "", ...a || []), s = SyntaxError(String(o));
	return s.code = e, t && (s.location = t), s.domain = r, s;
}
function defaultOnError(e) {
	throw e;
}
var RE_HTML_TAG = /<\/?[\w\s="/.':;#-\/]+>/, detectHtmlTag = (e) => RE_HTML_TAG.test(e), CHAR_SP = " ", CHAR_CR = "\r", CHAR_LF = "\n", CHAR_LS = "\u2028", CHAR_PS = "\u2029";
function createScanner(e) {
	let t = e, n = 0, r = 1, i = 1, a = 0, o = (e) => t[e] === CHAR_CR && t[e + 1] === CHAR_LF, s = (e) => t[e] === CHAR_LF, c = (e) => t[e] === CHAR_PS, l = (e) => t[e] === CHAR_LS, u = (e) => o(e) || s(e) || c(e) || l(e), d = () => n, f = () => r, p = () => i, m = () => a, g = (e) => o(e) || c(e) || l(e) ? CHAR_LF : t[e], _ = () => g(n), v = () => g(n + a);
	function y() {
		return a = 0, u(n) && (r++, i = 0), o(n) && n++, n++, i++, t[n];
	}
	function b() {
		return o(n + a) && a++, a++, t[n + a];
	}
	function x() {
		n = 0, r = 1, i = 1, a = 0;
	}
	function S(e = 0) {
		a = e;
	}
	function C() {
		let e = n + a;
		for (; e !== n;) y();
		a = 0;
	}
	return {
		index: d,
		line: f,
		column: p,
		peekOffset: m,
		charAt: g,
		currentChar: _,
		currentPeek: v,
		next: y,
		peek: b,
		reset: x,
		resetPeek: S,
		skipToPeek: C
	};
}
var EOF = void 0, LITERAL_DELIMITER = "'", ERROR_DOMAIN$3 = "tokenizer";
function createTokenizer(e, t = {}) {
	let n = t.location !== !1, r = createScanner(e), i = () => r.index(), a = () => createPosition(r.line(), r.column(), r.index()), o = a(), s = i(), c = {
		currentType: 13,
		offset: s,
		startLoc: o,
		endLoc: o,
		lastType: 13,
		lastOffset: s,
		lastStartLoc: o,
		lastEndLoc: o,
		braceNest: 0,
		inLinked: !1,
		text: ""
	}, l = () => c, { onError: u } = t;
	function d(e, t, r, ...i) {
		let a = l();
		t.column += r, t.offset += r, u && u(createCompileError(e, n ? createLocation(a.startLoc, t) : null, {
			domain: ERROR_DOMAIN$3,
			args: i
		}));
	}
	function f(e, t, r) {
		e.endLoc = a(), e.currentType = t;
		let i = { type: t };
		return n && (i.loc = createLocation(e.startLoc, e.endLoc)), r != null && (i.value = r), i;
	}
	let p = (e) => f(e, 13);
	function m(e, t) {
		return e.currentChar() === t ? (e.next(), t) : (d(CompileErrorCodes.EXPECTED_TOKEN, a(), 0, t), "");
	}
	function g(e) {
		let t = "";
		for (; e.currentPeek() === CHAR_SP || e.currentPeek() === CHAR_LF;) t += e.currentPeek(), e.peek();
		return t;
	}
	function _(e) {
		let t = g(e);
		return e.skipToPeek(), t;
	}
	function v(e) {
		if (e === EOF) return !1;
		let t = e.charCodeAt(0);
		return t >= 97 && t <= 122 || t >= 65 && t <= 90 || t === 95;
	}
	function y(e) {
		if (e === EOF) return !1;
		let t = e.charCodeAt(0);
		return t >= 48 && t <= 57;
	}
	function b(e, t) {
		let { currentType: n } = t;
		if (n !== 2) return !1;
		g(e);
		let r = v(e.currentPeek());
		return e.resetPeek(), r;
	}
	function x(e, t) {
		let { currentType: n } = t;
		if (n !== 2) return !1;
		g(e);
		let r = y(e.currentPeek() === "-" ? e.peek() : e.currentPeek());
		return e.resetPeek(), r;
	}
	function S(e, t) {
		let { currentType: n } = t;
		if (n !== 2) return !1;
		g(e);
		let r = e.currentPeek() === LITERAL_DELIMITER;
		return e.resetPeek(), r;
	}
	function C(e, t) {
		let { currentType: n } = t;
		if (n !== 7) return !1;
		g(e);
		let r = e.currentPeek() === ".";
		return e.resetPeek(), r;
	}
	function w(e, t) {
		let { currentType: n } = t;
		if (n !== 8) return !1;
		g(e);
		let r = v(e.currentPeek());
		return e.resetPeek(), r;
	}
	function T(e, t) {
		let { currentType: n } = t;
		if (!(n === 7 || n === 11)) return !1;
		g(e);
		let r = e.currentPeek() === ":";
		return e.resetPeek(), r;
	}
	function E(e, t) {
		let { currentType: n } = t;
		if (n !== 9) return !1;
		let r = () => {
			let t = e.currentPeek();
			return t === "{" ? v(e.peek()) : t === "@" || t === "|" || t === ":" || t === "." || t === CHAR_SP || !t ? !1 : t === CHAR_LF ? (e.peek(), r()) : O(e, !1);
		}, i = r();
		return e.resetPeek(), i;
	}
	function D(e) {
		g(e);
		let t = e.currentPeek() === "|";
		return e.resetPeek(), t;
	}
	function O(e, t = !0) {
		let n = (t = !1, r = "") => {
			let i = e.currentPeek();
			return i === "{" || i === "@" || !i ? t : i === "|" ? !(r === CHAR_SP || r === CHAR_LF) : i === CHAR_SP ? (e.peek(), n(!0, CHAR_SP)) : i === CHAR_LF ? (e.peek(), n(!0, CHAR_LF)) : !0;
		}, r = n();
		return t && e.resetPeek(), r;
	}
	function k(e, t) {
		let n = e.currentChar();
		return n === EOF ? EOF : t(n) ? (e.next(), n) : null;
	}
	function A(e) {
		let t = e.charCodeAt(0);
		return t >= 97 && t <= 122 || t >= 65 && t <= 90 || t >= 48 && t <= 57 || t === 95 || t === 36;
	}
	function j(e) {
		return k(e, A);
	}
	function M(e) {
		let t = e.charCodeAt(0);
		return t >= 97 && t <= 122 || t >= 65 && t <= 90 || t >= 48 && t <= 57 || t === 95 || t === 36 || t === 45;
	}
	function jl(e) {
		return k(e, M);
	}
	function Ml(e) {
		let t = e.charCodeAt(0);
		return t >= 48 && t <= 57;
	}
	function N(e) {
		return k(e, Ml);
	}
	function P(e) {
		let t = e.charCodeAt(0);
		return t >= 48 && t <= 57 || t >= 65 && t <= 70 || t >= 97 && t <= 102;
	}
	function F(e) {
		return k(e, P);
	}
	function I(e) {
		let t = "", n = "";
		for (; t = N(e);) n += t;
		return n;
	}
	function L(e) {
		let t = "";
		for (;;) {
			let n = e.currentChar();
			if (n === "{" || n === "}" || n === "@" || n === "|" || !n) break;
			if (n === CHAR_SP || n === CHAR_LF) if (O(e)) t += n, e.next();
			else if (D(e)) break;
			else t += n, e.next();
			else t += n, e.next();
		}
		return t;
	}
	function R(e) {
		_(e);
		let t = "", n = "";
		for (; t = jl(e);) n += t;
		return e.currentChar() === EOF && d(CompileErrorCodes.UNTERMINATED_CLOSING_BRACE, a(), 0), n;
	}
	function z(e) {
		_(e);
		let t = "";
		return e.currentChar() === "-" ? (e.next(), t += `-${I(e)}`) : t += I(e), e.currentChar() === EOF && d(CompileErrorCodes.UNTERMINATED_CLOSING_BRACE, a(), 0), t;
	}
	function B(e) {
		return e !== LITERAL_DELIMITER && e !== CHAR_LF;
	}
	function V(e) {
		_(e), m(e, "'");
		let t = "", n = "";
		for (; t = k(e, B);) t === "\\" ? n += H(e) : n += t;
		let r = e.currentChar();
		return r === CHAR_LF || r === EOF ? (d(CompileErrorCodes.UNTERMINATED_SINGLE_QUOTE_IN_PLACEHOLDER, a(), 0), r === CHAR_LF && (e.next(), m(e, "'")), n) : (m(e, "'"), n);
	}
	function H(e) {
		let t = e.currentChar();
		switch (t) {
			case "\\":
			case "'": return e.next(), `\\${t}`;
			case "u": return U(e, t, 4);
			case "U": return U(e, t, 6);
			default: return d(CompileErrorCodes.UNKNOWN_ESCAPE_SEQUENCE, a(), 0, t), "";
		}
	}
	function U(e, t, n) {
		m(e, t);
		let r = "";
		for (let i = 0; i < n; i++) {
			let n = F(e);
			if (!n) {
				d(CompileErrorCodes.INVALID_UNICODE_ESCAPE_SEQUENCE, a(), 0, `\\${t}${r}${e.currentChar()}`);
				break;
			}
			r += n;
		}
		return `\\${t}${r}`;
	}
	function W(e) {
		return e !== "{" && e !== "}" && e !== CHAR_SP && e !== CHAR_LF;
	}
	function G(e) {
		_(e);
		let t = "", n = "";
		for (; t = k(e, W);) n += t;
		return n;
	}
	function K(e) {
		let t = "", n = "";
		for (; t = j(e);) n += t;
		return n;
	}
	function q(e) {
		let t = (n) => {
			let r = e.currentChar();
			return r === "{" || r === "@" || r === "|" || r === "(" || r === ")" || !r || r === CHAR_SP ? n : (n += r, e.next(), t(n));
		};
		return t("");
	}
	function J(e) {
		_(e);
		let t = m(e, "|");
		return _(e), t;
	}
	function Y(e, t) {
		let n = null;
		switch (e.currentChar()) {
			case "{": return t.braceNest >= 1 && d(CompileErrorCodes.NOT_ALLOW_NEST_PLACEHOLDER, a(), 0), e.next(), n = f(t, 2, "{"), _(e), t.braceNest++, n;
			case "}": return t.braceNest > 0 && t.currentType === 2 && d(CompileErrorCodes.EMPTY_PLACEHOLDER, a(), 0), e.next(), n = f(t, 3, "}"), t.braceNest--, t.braceNest > 0 && _(e), t.inLinked && t.braceNest === 0 && (t.inLinked = !1), n;
			case "@": return t.braceNest > 0 && d(CompileErrorCodes.UNTERMINATED_CLOSING_BRACE, a(), 0), n = X(e, t) || p(t), t.braceNest = 0, n;
			default: {
				let r = !0, i = !0, o = !0;
				if (D(e)) return t.braceNest > 0 && d(CompileErrorCodes.UNTERMINATED_CLOSING_BRACE, a(), 0), n = f(t, 1, J(e)), t.braceNest = 0, t.inLinked = !1, n;
				if (t.braceNest > 0 && (t.currentType === 4 || t.currentType === 5 || t.currentType === 6)) return d(CompileErrorCodes.UNTERMINATED_CLOSING_BRACE, a(), 0), t.braceNest = 0, Z(e, t);
				if (r = b(e, t)) return n = f(t, 4, R(e)), _(e), n;
				if (i = x(e, t)) return n = f(t, 5, z(e)), _(e), n;
				if (o = S(e, t)) return n = f(t, 6, V(e)), _(e), n;
				if (!r && !i && !o) return n = f(t, 12, G(e)), d(CompileErrorCodes.INVALID_TOKEN_IN_PLACEHOLDER, a(), 0, n.value), _(e), n;
				break;
			}
		}
		return n;
	}
	function X(e, t) {
		let { currentType: n } = t, r = null, i = e.currentChar();
		switch ((n === 7 || n === 8 || n === 11 || n === 9) && (i === CHAR_LF || i === CHAR_SP) && d(CompileErrorCodes.INVALID_LINKED_FORMAT, a(), 0), i) {
			case "@": return e.next(), r = f(t, 7, "@"), t.inLinked = !0, r;
			case ".": return _(e), e.next(), f(t, 8, ".");
			case ":": return _(e), e.next(), f(t, 9, ":");
			default: return D(e) ? (r = f(t, 1, J(e)), t.braceNest = 0, t.inLinked = !1, r) : C(e, t) || T(e, t) ? (_(e), X(e, t)) : w(e, t) ? (_(e), f(t, 11, K(e))) : E(e, t) ? (_(e), i === "{" ? Y(e, t) || r : f(t, 10, q(e))) : (n === 7 && d(CompileErrorCodes.INVALID_LINKED_FORMAT, a(), 0), t.braceNest = 0, t.inLinked = !1, Z(e, t));
		}
	}
	function Z(e, t) {
		let n = { type: 13 };
		if (t.braceNest > 0) return Y(e, t) || p(t);
		if (t.inLinked) return X(e, t) || p(t);
		switch (e.currentChar()) {
			case "{": return Y(e, t) || p(t);
			case "}": return d(CompileErrorCodes.UNBALANCED_CLOSING_BRACE, a(), 0), e.next(), f(t, 3, "}");
			case "@": return X(e, t) || p(t);
			default:
				if (D(e)) return n = f(t, 1, J(e)), t.braceNest = 0, t.inLinked = !1, n;
				if (O(e)) return f(t, 0, L(e));
				break;
		}
		return n;
	}
	function Q() {
		let { currentType: e, offset: t, startLoc: n, endLoc: o } = c;
		return c.lastType = e, c.lastOffset = t, c.lastStartLoc = n, c.lastEndLoc = o, c.offset = i(), c.startLoc = a(), r.currentChar() === EOF ? f(c, 13) : Z(r, c);
	}
	return {
		nextToken: Q,
		currentOffset: i,
		currentPosition: a,
		context: l
	};
}
var ERROR_DOMAIN$2 = "parser", KNOWN_ESCAPES = /(?:\\\\|\\'|\\u([0-9a-fA-F]{4})|\\U([0-9a-fA-F]{6}))/g;
function fromEscapeSequence(e, t, n) {
	switch (e) {
		case "\\\\": return "\\";
		case "\\'": return "'";
		default: {
			let e = parseInt(t || n, 16);
			return e <= 55295 || e >= 57344 ? String.fromCodePoint(e) : "�";
		}
	}
}
function createParser(e = {}) {
	let t = e.location !== !1, { onError: n } = e;
	function r(e, r, i, a, ...o) {
		let s = e.currentPosition();
		s.offset += a, s.column += a, n && n(createCompileError(r, t ? createLocation(i, s) : null, {
			domain: ERROR_DOMAIN$2,
			args: o
		}));
	}
	function i(e, n, r) {
		let i = { type: e };
		return t && (i.start = n, i.end = n, i.loc = {
			start: r,
			end: r
		}), i;
	}
	function a(e, n, r, i) {
		t && (e.end = n, e.loc && (e.loc.end = r));
	}
	function o(e, t) {
		let n = e.context(), r = i(3, n.offset, n.startLoc);
		return r.value = t, a(r, e.currentOffset(), e.currentPosition()), r;
	}
	function s(e, t) {
		let { lastOffset: n, lastStartLoc: r } = e.context(), o = i(5, n, r);
		return o.index = parseInt(t, 10), e.nextToken(), a(o, e.currentOffset(), e.currentPosition()), o;
	}
	function c(e, t) {
		let { lastOffset: n, lastStartLoc: r } = e.context(), o = i(4, n, r);
		return o.key = t, e.nextToken(), a(o, e.currentOffset(), e.currentPosition()), o;
	}
	function l(e, t) {
		let { lastOffset: n, lastStartLoc: r } = e.context(), o = i(9, n, r);
		return o.value = t.replace(KNOWN_ESCAPES, fromEscapeSequence), e.nextToken(), a(o, e.currentOffset(), e.currentPosition()), o;
	}
	function u(e) {
		let t = e.nextToken(), n = e.context(), { lastOffset: o, lastStartLoc: s } = n, c = i(8, o, s);
		return t.type === 11 ? (t.value ?? r(e, CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS, n.lastStartLoc, 0, getTokenCaption(t)), c.value = t.value || "", a(c, e.currentOffset(), e.currentPosition()), { node: c }) : (r(e, CompileErrorCodes.UNEXPECTED_EMPTY_LINKED_MODIFIER, n.lastStartLoc, 0), c.value = "", a(c, o, s), {
			nextConsumeToken: t,
			node: c
		});
	}
	function d(e, t) {
		let n = e.context(), r = i(7, n.offset, n.startLoc);
		return r.value = t, a(r, e.currentOffset(), e.currentPosition()), r;
	}
	function f(e) {
		let t = e.context(), n = i(6, t.offset, t.startLoc), o = e.nextToken();
		if (o.type === 8) {
			let t = u(e);
			n.modifier = t.node, o = t.nextConsumeToken || e.nextToken();
		}
		switch (o.type !== 9 && r(e, CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS, t.lastStartLoc, 0, getTokenCaption(o)), o = e.nextToken(), o.type === 2 && (o = e.nextToken()), o.type) {
			case 10:
				o.value ?? r(e, CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS, t.lastStartLoc, 0, getTokenCaption(o)), n.key = d(e, o.value || "");
				break;
			case 4:
				o.value ?? r(e, CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS, t.lastStartLoc, 0, getTokenCaption(o)), n.key = c(e, o.value || "");
				break;
			case 5:
				o.value ?? r(e, CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS, t.lastStartLoc, 0, getTokenCaption(o)), n.key = s(e, o.value || "");
				break;
			case 6:
				o.value ?? r(e, CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS, t.lastStartLoc, 0, getTokenCaption(o)), n.key = l(e, o.value || "");
				break;
			default: {
				r(e, CompileErrorCodes.UNEXPECTED_EMPTY_LINKED_KEY, t.lastStartLoc, 0);
				let s = e.context(), c = i(7, s.offset, s.startLoc);
				return c.value = "", a(c, s.offset, s.startLoc), n.key = c, a(n, s.offset, s.startLoc), {
					nextConsumeToken: o,
					node: n
				};
			}
		}
		return a(n, e.currentOffset(), e.currentPosition()), { node: n };
	}
	function p(e) {
		let t = e.context(), n = i(2, t.currentType === 1 ? e.currentOffset() : t.offset, t.currentType === 1 ? t.endLoc : t.startLoc);
		n.items = [];
		let u = null;
		do {
			let i = u || e.nextToken();
			switch (u = null, i.type) {
				case 0:
					i.value ?? r(e, CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS, t.lastStartLoc, 0, getTokenCaption(i)), n.items.push(o(e, i.value || ""));
					break;
				case 5:
					i.value ?? r(e, CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS, t.lastStartLoc, 0, getTokenCaption(i)), n.items.push(s(e, i.value || ""));
					break;
				case 4:
					i.value ?? r(e, CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS, t.lastStartLoc, 0, getTokenCaption(i)), n.items.push(c(e, i.value || ""));
					break;
				case 6:
					i.value ?? r(e, CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS, t.lastStartLoc, 0, getTokenCaption(i)), n.items.push(l(e, i.value || ""));
					break;
				case 7: {
					let t = f(e);
					n.items.push(t.node), u = t.nextConsumeToken || null;
					break;
				}
			}
		} while (t.currentType !== 13 && t.currentType !== 1);
		return a(n, t.currentType === 1 ? t.lastOffset : e.currentOffset(), t.currentType === 1 ? t.lastEndLoc : e.currentPosition()), n;
	}
	function m(e, t, n, o) {
		let s = e.context(), c = o.items.length === 0, l = i(1, t, n);
		l.cases = [], l.cases.push(o);
		do {
			let t = p(e);
			c ||= t.items.length === 0, l.cases.push(t);
		} while (s.currentType !== 13);
		return c && r(e, CompileErrorCodes.MUST_HAVE_MESSAGES_IN_PLURAL, n, 0), a(l, e.currentOffset(), e.currentPosition()), l;
	}
	function g(e) {
		let t = e.context(), { offset: n, startLoc: r } = t, i = p(e);
		return t.currentType === 13 ? i : m(e, n, r, i);
	}
	function _(n) {
		let o = createTokenizer(n, assign({}, e)), s = o.context(), c = i(0, s.offset, s.startLoc);
		return t && c.loc && (c.loc.source = n), c.body = g(o), e.onCacheKey && (c.cacheKey = e.onCacheKey(n)), s.currentType !== 13 && r(o, CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS, s.lastStartLoc, 0, n[s.offset] || ""), a(c, o.currentOffset(), o.currentPosition()), c;
	}
	return { parse: _ };
}
function getTokenCaption(e) {
	if (e.type === 13) return "EOF";
	let t = (e.value || "").replace(/\r?\n/gu, "\\n");
	return t.length > 10 ? t.slice(0, 9) + "…" : t;
}
function createTransformer(e, t = {}) {
	let n = {
		ast: e,
		helpers: /* @__PURE__ */ new Set()
	};
	return {
		context: () => n,
		helper: (e) => (n.helpers.add(e), e)
	};
}
function traverseNodes(e, t) {
	for (let n = 0; n < e.length; n++) traverseNode(e[n], t);
}
function traverseNode(e, t) {
	switch (e.type) {
		case 1:
			traverseNodes(e.cases, t), t.helper("plural");
			break;
		case 2:
			traverseNodes(e.items, t);
			break;
		case 6:
			traverseNode(e.key, t), t.helper("linked"), t.helper("type");
			break;
		case 5:
			t.helper("interpolate"), t.helper("list");
			break;
		case 4:
			t.helper("interpolate"), t.helper("named");
			break;
	}
}
function transform(e, t = {}) {
	let n = createTransformer(e);
	n.helper("normalize"), e.body && traverseNode(e.body, n);
	let r = n.context();
	e.helpers = Array.from(r.helpers);
}
function optimize(e) {
	let t = e.body;
	return t.type === 2 ? optimizeMessageNode(t) : t.cases.forEach((e) => optimizeMessageNode(e)), e;
}
function optimizeMessageNode(e) {
	if (e.items.length === 1) {
		let t = e.items[0];
		(t.type === 3 || t.type === 9) && (e.static = t.value, delete t.value);
	} else {
		let t = [];
		for (let n = 0; n < e.items.length; n++) {
			let r = e.items[n];
			if (!(r.type === 3 || r.type === 9) || r.value == null) break;
			t.push(r.value);
		}
		if (t.length === e.items.length) {
			e.static = join(t);
			for (let t = 0; t < e.items.length; t++) {
				let n = e.items[t];
				(n.type === 3 || n.type === 9) && delete n.value;
			}
		}
	}
}
var ERROR_DOMAIN$1 = "minifier";
function minify(e) {
	switch (e.t = e.type, e.type) {
		case 0: {
			let t = e;
			minify(t.body), t.b = t.body, delete t.body;
			break;
		}
		case 1: {
			let t = e, n = t.cases;
			for (let e = 0; e < n.length; e++) minify(n[e]);
			t.c = n, delete t.cases;
			break;
		}
		case 2: {
			let t = e, n = t.items;
			for (let e = 0; e < n.length; e++) minify(n[e]);
			t.i = n, delete t.items, t.static && (t.s = t.static, delete t.static);
			break;
		}
		case 3:
		case 9:
		case 8:
		case 7: {
			let t = e;
			t.value && (t.v = t.value, delete t.value);
			break;
		}
		case 6: {
			let t = e;
			minify(t.key), t.k = t.key, delete t.key, t.modifier && (minify(t.modifier), t.m = t.modifier, delete t.modifier);
			break;
		}
		case 5: {
			let t = e;
			t.i = t.index, delete t.index;
			break;
		}
		case 4: {
			let t = e;
			t.k = t.key, delete t.key;
			break;
		}
		default: if (process.env.NODE_ENV !== "production") throw createCompileError(CompileErrorCodes.UNHANDLED_MINIFIER_NODE_TYPE, null, {
			domain: ERROR_DOMAIN$1,
			args: [e.type]
		});
	}
	delete e.type;
}
var ERROR_DOMAIN = "parser";
function createCodeGenerator(e, t) {
	let { sourceMap: n, filename: r, breakLineCode: i, needIndent: a } = t, o = t.location !== !1, s = {
		filename: r,
		code: "",
		column: 1,
		line: 1,
		offset: 0,
		map: void 0,
		breakLineCode: i,
		needIndent: a,
		indentLevel: 0
	};
	o && e.loc && (s.source = e.loc.source);
	let c = () => s;
	function l(e, t) {
		s.code += e;
	}
	function u(e, t = !0) {
		let n = t ? i : "";
		l(a ? n + "  ".repeat(e) : n);
	}
	function d(e = !0) {
		let t = ++s.indentLevel;
		e && u(t);
	}
	function f(e = !0) {
		let t = --s.indentLevel;
		e && u(t);
	}
	function p() {
		u(s.indentLevel);
	}
	return {
		context: c,
		push: l,
		indent: d,
		deindent: f,
		newline: p,
		helper: (e) => `_${e}`,
		needIndent: () => s.needIndent
	};
}
function generateLinkedNode(e, t) {
	let { helper: n } = e;
	e.push(`${n("linked")}(`), generateNode(e, t.key), t.modifier ? (e.push(", "), generateNode(e, t.modifier), e.push(", _type")) : e.push(", undefined, _type"), e.push(")");
}
function generateMessageNode(e, t) {
	let { helper: n, needIndent: r } = e;
	e.push(`${n("normalize")}([`), e.indent(r());
	let i = t.items.length;
	for (let n = 0; n < i && (generateNode(e, t.items[n]), n !== i - 1); n++) e.push(", ");
	e.deindent(r()), e.push("])");
}
function generatePluralNode(e, t) {
	let { helper: n, needIndent: r } = e;
	if (t.cases.length > 1) {
		e.push(`${n("plural")}([`), e.indent(r());
		let i = t.cases.length;
		for (let n = 0; n < i && (generateNode(e, t.cases[n]), n !== i - 1); n++) e.push(", ");
		e.deindent(r()), e.push("])");
	}
}
function generateResource(e, t) {
	t.body ? generateNode(e, t.body) : e.push("null");
}
function generateNode(e, t) {
	let { helper: n } = e;
	switch (t.type) {
		case 0:
			generateResource(e, t);
			break;
		case 1:
			generatePluralNode(e, t);
			break;
		case 2:
			generateMessageNode(e, t);
			break;
		case 6:
			generateLinkedNode(e, t);
			break;
		case 8:
			e.push(JSON.stringify(t.value), t);
			break;
		case 7:
			e.push(JSON.stringify(t.value), t);
			break;
		case 5:
			e.push(`${n("interpolate")}(${n("list")}(${t.index}))`, t);
			break;
		case 4:
			e.push(`${n("interpolate")}(${n("named")}(${JSON.stringify(t.key)}))`, t);
			break;
		case 9:
			e.push(JSON.stringify(t.value), t);
			break;
		case 3:
			e.push(JSON.stringify(t.value), t);
			break;
		default: if (process.env.NODE_ENV !== "production") throw createCompileError(CompileErrorCodes.UNHANDLED_CODEGEN_NODE_TYPE, null, {
			domain: ERROR_DOMAIN,
			args: [t.type]
		});
	}
}
var generate = (e, t = {}) => {
	let n = isString$1(t.mode) ? t.mode : "normal", r = isString$1(t.filename) ? t.filename : "message.intl", i = !!t.sourceMap, a = t.breakLineCode == null ? n === "arrow" ? ";" : "\n" : t.breakLineCode, o = t.needIndent ? t.needIndent : n !== "arrow", s = e.helpers || [], c = createCodeGenerator(e, {
		mode: n,
		filename: r,
		sourceMap: i,
		breakLineCode: a,
		needIndent: o
	});
	c.push(n === "normal" ? "function __msg__ (ctx) {" : "(ctx) => {"), c.indent(o), s.length > 0 && (c.push(`const { ${join(s.map((e) => `${e}: _${e}`), ", ")} } = ctx`), c.newline()), c.push("return "), generateNode(c, e), c.deindent(o), c.push("}"), delete e.helpers;
	let { code: l, map: u } = c.context();
	return {
		ast: e,
		code: l,
		map: u ? u.toJSON() : void 0
	};
};
function baseCompile(e, t = {}) {
	let n = assign({}, t), r = !!n.jit, i = !!n.minify, a = n.optimize == null ? !0 : n.optimize, o = createParser(n).parse(e);
	return r ? (a && optimize(o), i && minify(o), {
		ast: o,
		code: ""
	}) : (transform(o, n), generate(o, n));
}
function initFeatureFlags$1() {
	typeof __INTLIFY_PROD_DEVTOOLS__ != "boolean" && (getGlobalThis().__INTLIFY_PROD_DEVTOOLS__ = !1), typeof __INTLIFY_DROP_MESSAGE_COMPILER__ != "boolean" && (getGlobalThis().__INTLIFY_DROP_MESSAGE_COMPILER__ = !1);
}
function isMessageAST(e) {
	return isObject$1(e) && resolveType(e) === 0 && (hasOwn(e, "b") || hasOwn(e, "body"));
}
var PROPS_BODY = ["b", "body"];
function resolveBody(e) {
	return resolveProps(e, PROPS_BODY);
}
var PROPS_CASES = ["c", "cases"];
function resolveCases(e) {
	return resolveProps(e, PROPS_CASES, []);
}
var PROPS_STATIC = ["s", "static"];
function resolveStatic(e) {
	return resolveProps(e, PROPS_STATIC);
}
var PROPS_ITEMS = ["i", "items"];
function resolveItems(e) {
	return resolveProps(e, PROPS_ITEMS, []);
}
var PROPS_TYPE = ["t", "type"];
function resolveType(e) {
	return resolveProps(e, PROPS_TYPE);
}
var PROPS_VALUE = ["v", "value"];
function resolveValue$1(e, t) {
	let n = resolveProps(e, PROPS_VALUE);
	if (n != null) return n;
	throw createUnhandleNodeError(t);
}
var PROPS_MODIFIER = ["m", "modifier"];
function resolveLinkedModifier(e) {
	return resolveProps(e, PROPS_MODIFIER);
}
var PROPS_KEY = ["k", "key"];
function resolveLinkedKey(e) {
	let t = resolveProps(e, PROPS_KEY);
	if (t) return t;
	throw createUnhandleNodeError(6);
}
function resolveProps(e, t, n) {
	for (let n = 0; n < t.length; n++) {
		let r = t[n];
		if (hasOwn(e, r) && e[r] != null) return e[r];
	}
	return n;
}
var AST_NODE_PROPS_KEYS = [
	...PROPS_BODY,
	...PROPS_CASES,
	...PROPS_STATIC,
	...PROPS_ITEMS,
	...PROPS_KEY,
	...PROPS_MODIFIER,
	...PROPS_VALUE,
	...PROPS_TYPE
];
function createUnhandleNodeError(e) {
	return /* @__PURE__ */ Error(`unhandled node type: ${e}`);
}
function format$1(e) {
	return (t) => formatParts(t, e);
}
function formatParts(e, t) {
	let n = resolveBody(t);
	if (n == null) throw createUnhandleNodeError(0);
	if (resolveType(n) === 1) {
		let t = resolveCases(n);
		return e.plural(t.reduce((t, n) => [...t, formatMessageParts(e, n)], []));
	} else return formatMessageParts(e, n);
}
function formatMessageParts(e, t) {
	let n = resolveStatic(t);
	if (n != null) return e.type === "text" ? n : e.normalize([n]);
	{
		let n = resolveItems(t).reduce((t, n) => [...t, formatMessagePart(e, n)], []);
		return e.normalize(n);
	}
}
function formatMessagePart(e, t) {
	let n = resolveType(t);
	switch (n) {
		case 3: return resolveValue$1(t, n);
		case 9: return resolveValue$1(t, n);
		case 4: {
			let r = t;
			if (hasOwn(r, "k") && r.k) return e.interpolate(e.named(r.k));
			if (hasOwn(r, "key") && r.key) return e.interpolate(e.named(r.key));
			throw createUnhandleNodeError(n);
		}
		case 5: {
			let r = t;
			if (hasOwn(r, "i") && isNumber$1(r.i)) return e.interpolate(e.list(r.i));
			if (hasOwn(r, "index") && isNumber$1(r.index)) return e.interpolate(e.list(r.index));
			throw createUnhandleNodeError(n);
		}
		case 6: {
			let n = t, r = resolveLinkedModifier(n), i = resolveLinkedKey(n);
			return e.linked(formatMessagePart(e, i), r ? formatMessagePart(e, r) : void 0, e.type);
		}
		case 7: return resolveValue$1(t, n);
		case 8: return resolveValue$1(t, n);
		default: throw Error(`unhandled node on format message part: ${n}`);
	}
}
var WARN_MESSAGE = "Detected HTML in '{source}' message. Recommend not using HTML messages to avoid XSS.";
function checkHtmlMessage(e, t) {
	t && detectHtmlTag(e) && warn(format(WARN_MESSAGE, { source: e }));
}
var defaultOnCacheKey = (e) => e, compileCache = create();
function baseCompile$1(e, t = {}) {
	let n = !1, r = t.onError || defaultOnError;
	return t.onError = (e) => {
		n = !0, r(e);
	}, {
		...baseCompile(e, t),
		detectError: n
	};
}
/* @__NO_SIDE_EFFECTS__ */
function compile(e, t) {
	if (!__INTLIFY_DROP_MESSAGE_COMPILER__ && isString$1(e)) {
		let n = isBoolean$1(t.warnHtmlMessage) ? t.warnHtmlMessage : !0;
		process.env.NODE_ENV !== "production" && checkHtmlMessage(e, n);
		let r = (t.onCacheKey || defaultOnCacheKey)(e), i = compileCache[r];
		if (i) return i;
		let { ast: a, detectError: o } = baseCompile$1(e, {
			...t,
			location: process.env.NODE_ENV !== "production",
			jit: !0
		}), s = format$1(a);
		return o ? s : compileCache[r] = s;
	} else {
		if (process.env.NODE_ENV !== "production" && !isMessageAST(e)) return warn(`the message that is resolve with key '${t.key}' is not supported for jit compilation`), (() => e);
		let n = e.cacheKey;
		return n ? compileCache[n] || (compileCache[n] = format$1(e)) : format$1(e);
	}
}
var devtools = null;
function setDevToolsHook(e) {
	devtools = e;
}
function initI18nDevTools(e, t, n) {
	devtools && devtools.emit("i18n:init", {
		timestamp: Date.now(),
		i18n: e,
		version: t,
		meta: n
	});
}
var translateDevTools = /* @__PURE__ */ createDevToolsHook("function:translate");
function createDevToolsHook(e) {
	return (t) => devtools && devtools.emit(e, t);
}
var CoreErrorCodes = {
	INVALID_ARGUMENT: 17,
	INVALID_DATE_ARGUMENT: 18,
	INVALID_ISO_DATE_ARGUMENT: 19,
	NOT_SUPPORT_NON_STRING_MESSAGE: 20,
	NOT_SUPPORT_LOCALE_PROMISE_VALUE: 21,
	NOT_SUPPORT_LOCALE_ASYNC_FUNCTION: 22,
	NOT_SUPPORT_LOCALE_TYPE: 23
};
function createCoreError(e) {
	return createCompileError(e, null, process.env.NODE_ENV === "production" ? void 0 : { messages: errorMessages$1 });
}
var errorMessages$1 = {
	[CoreErrorCodes.INVALID_ARGUMENT]: "Invalid arguments",
	[CoreErrorCodes.INVALID_DATE_ARGUMENT]: "The date provided is an invalid Date object.Make sure your Date represents a valid date.",
	[CoreErrorCodes.INVALID_ISO_DATE_ARGUMENT]: "The argument provided is not a valid ISO date string",
	[CoreErrorCodes.NOT_SUPPORT_NON_STRING_MESSAGE]: "Not support non-string message",
	[CoreErrorCodes.NOT_SUPPORT_LOCALE_PROMISE_VALUE]: "cannot support promise value",
	[CoreErrorCodes.NOT_SUPPORT_LOCALE_ASYNC_FUNCTION]: "cannot support async function",
	[CoreErrorCodes.NOT_SUPPORT_LOCALE_TYPE]: "cannot support locale type"
};
function getLocale(e, t) {
	return t.locale == null ? resolveLocale(e.locale) : resolveLocale(t.locale);
}
var _resolveLocale;
function resolveLocale(e) {
	if (isString$1(e)) return e;
	if (isFunction$1(e)) {
		if (e.resolvedOnce && _resolveLocale != null) return _resolveLocale;
		if (e.constructor.name === "Function") {
			let t = e();
			if (isPromise(t)) throw createCoreError(CoreErrorCodes.NOT_SUPPORT_LOCALE_PROMISE_VALUE);
			return _resolveLocale = t;
		} else throw createCoreError(CoreErrorCodes.NOT_SUPPORT_LOCALE_ASYNC_FUNCTION);
	} else throw createCoreError(CoreErrorCodes.NOT_SUPPORT_LOCALE_TYPE);
}
function fallbackWithSimple(e, t, n) {
	return [...new Set([n, ...isArray$1(t) ? t : isObject$1(t) ? Object.keys(t) : isString$1(t) ? [t] : [n]])];
}
function fallbackWithLocaleChain(e, t, n) {
	let r = isString$1(n) ? n : DEFAULT_LOCALE, i = e;
	i.__localeChainCache ||= /* @__PURE__ */ new Map();
	let a = i.__localeChainCache.get(r);
	if (!a) {
		a = [];
		let e = [n];
		for (; isArray$1(e);) e = appendBlockToChain(a, e, t);
		let o = isArray$1(t) || !isPlainObject(t) ? t : t.default ? t.default : null;
		e = isString$1(o) ? [o] : o, isArray$1(e) && appendBlockToChain(a, e, !1), i.__localeChainCache.set(r, a);
	}
	return a;
}
function appendBlockToChain(e, t, n) {
	let r = !0;
	for (let i = 0; i < t.length && isBoolean$1(r); i++) {
		let a = t[i];
		isString$1(a) && (r = appendLocaleToChain(e, t[i], n));
	}
	return r;
}
function appendLocaleToChain(e, t, n) {
	let r, i = t.split("-");
	do
		r = appendItemToChain(e, i.join("-"), n), i.splice(-1, 1);
	while (i.length && r === !0);
	return r;
}
function appendItemToChain(e, t, n) {
	let r = !1;
	if (!e.includes(t) && (r = !0, t)) {
		r = t[t.length - 1] !== "!";
		let i = t.replace(/!/g, "");
		e.push(i), (isArray$1(n) || isPlainObject(n)) && n[i] && (r = n[i]);
	}
	return r;
}
var pathStateMachine = [];
pathStateMachine[0] = {
	w: [0],
	i: [3, 0],
	"[": [4],
	o: [7]
}, pathStateMachine[1] = {
	w: [1],
	".": [2],
	"[": [4],
	o: [7]
}, pathStateMachine[2] = {
	w: [2],
	i: [3, 0],
	0: [3, 0]
}, pathStateMachine[3] = {
	i: [3, 0],
	0: [3, 0],
	w: [1, 1],
	".": [2, 1],
	"[": [4, 1],
	o: [7, 1]
}, pathStateMachine[4] = {
	"'": [5, 0],
	"\"": [6, 0],
	"[": [4, 2],
	"]": [1, 3],
	o: 8,
	l: [4, 0]
}, pathStateMachine[5] = {
	"'": [4, 0],
	o: 8,
	l: [5, 0]
}, pathStateMachine[6] = {
	"\"": [4, 0],
	o: 8,
	l: [6, 0]
};
var literalValueRE = /^\s?(?:true|false|-?[\d.]+|'[^']*'|"[^"]*")\s?$/;
function isLiteral(e) {
	return literalValueRE.test(e);
}
function stripQuotes(e) {
	let t = e.charCodeAt(0);
	return t === e.charCodeAt(e.length - 1) && (t === 34 || t === 39) ? e.slice(1, -1) : e;
}
function getPathCharType(e) {
	if (e == null) return "o";
	switch (e.charCodeAt(0)) {
		case 91:
		case 93:
		case 46:
		case 34:
		case 39: return e;
		case 95:
		case 36:
		case 45: return "i";
		case 9:
		case 10:
		case 13:
		case 160:
		case 65279:
		case 8232:
		case 8233: return "w";
	}
	return "i";
}
function formatSubPath(e) {
	let t = e.trim();
	return e.charAt(0) === "0" && isNaN(parseInt(e)) ? !1 : isLiteral(t) ? stripQuotes(t) : "*" + t;
}
function parse(e) {
	let t = [], n = -1, r = 0, i = 0, a, o, s, c, l, u, d, f = [];
	f[0] = () => {
		o === void 0 ? o = s : o += s;
	}, f[1] = () => {
		o !== void 0 && (t.push(o), o = void 0);
	}, f[2] = () => {
		f[0](), i++;
	}, f[3] = () => {
		if (i > 0) i--, r = 4, f[0]();
		else {
			if (i = 0, o === void 0 || (o = formatSubPath(o), o === !1)) return !1;
			f[1]();
		}
	};
	function p() {
		let t = e[n + 1];
		if (r === 5 && t === "'" || r === 6 && t === "\"") return n++, s = "\\" + t, f[0](), !0;
	}
	for (; r !== null;) if (n++, a = e[n], !(a === "\\" && p())) {
		if (c = getPathCharType(a), d = pathStateMachine[r], l = d[c] || d.l || 8, l === 8 || (r = l[0], l[1] !== void 0 && (u = f[l[1]], u && (s = a, u() === !1)))) return;
		if (r === 7) return t;
	}
}
var cache = /* @__PURE__ */ new Map();
function resolveWithKeyValue(e, t) {
	return isObject$1(e) ? e[t] : null;
}
function resolveValue(e, t) {
	if (!isObject$1(e)) return null;
	let n = cache.get(t);
	if (n || (n = parse(t), n && cache.set(t, n)), !n) return null;
	let r = n.length, i = e, a = 0;
	for (; a < r;) {
		let e = n[a];
		if (AST_NODE_PROPS_KEYS.includes(e) && isMessageAST(i)) return null;
		let t = i[e];
		if (t === void 0 || isFunction$1(i)) return null;
		i = t, a++;
	}
	return i;
}
var CoreWarnCodes = {
	NOT_FOUND_KEY: 1,
	FALLBACK_TO_TRANSLATE: 2,
	CANNOT_FORMAT_NUMBER: 3,
	FALLBACK_TO_NUMBER_FORMAT: 4,
	CANNOT_FORMAT_DATE: 5,
	FALLBACK_TO_DATE_FORMAT: 6,
	EXPERIMENTAL_CUSTOM_MESSAGE_COMPILER: 7
}, warnMessages$1 = {
	[CoreWarnCodes.NOT_FOUND_KEY]: "Not found '{key}' key in '{locale}' locale messages.",
	[CoreWarnCodes.FALLBACK_TO_TRANSLATE]: "Fall back to translate '{key}' key with '{target}' locale.",
	[CoreWarnCodes.CANNOT_FORMAT_NUMBER]: "Cannot format a number value due to not supported Intl.NumberFormat.",
	[CoreWarnCodes.FALLBACK_TO_NUMBER_FORMAT]: "Fall back to number format '{key}' key with '{target}' locale.",
	[CoreWarnCodes.CANNOT_FORMAT_DATE]: "Cannot format a date value due to not supported Intl.DateTimeFormat.",
	[CoreWarnCodes.FALLBACK_TO_DATE_FORMAT]: "Fall back to datetime format '{key}' key with '{target}' locale.",
	[CoreWarnCodes.EXPERIMENTAL_CUSTOM_MESSAGE_COMPILER]: "This project is using Custom Message Compiler, which is an experimental feature. It may receive breaking changes or be removed in the future."
};
function getWarnMessage$1(e, ...t) {
	return format(warnMessages$1[e], ...t);
}
var VERSION$1 = "11.1.11", DEFAULT_LOCALE = "en-US", capitalize = (e) => `${e.charAt(0).toLocaleUpperCase()}${e.substr(1)}`;
function getDefaultLinkedModifiers() {
	return {
		upper: (e, t) => t === "text" && isString$1(e) ? e.toUpperCase() : t === "vnode" && isObject$1(e) && "__v_isVNode" in e ? e.children.toUpperCase() : e,
		lower: (e, t) => t === "text" && isString$1(e) ? e.toLowerCase() : t === "vnode" && isObject$1(e) && "__v_isVNode" in e ? e.children.toLowerCase() : e,
		capitalize: (e, t) => t === "text" && isString$1(e) ? capitalize(e) : t === "vnode" && isObject$1(e) && "__v_isVNode" in e ? capitalize(e.children) : e
	};
}
var _compiler;
function registerMessageCompiler(e) {
	_compiler = e;
}
var _resolver;
function registerMessageResolver(e) {
	_resolver = e;
}
var _fallbacker;
function registerLocaleFallbacker(e) {
	_fallbacker = e;
}
var _additionalMeta = null, getAdditionalMeta = /* @__NO_SIDE_EFFECTS__ */ () => _additionalMeta, _fallbackContext = null, setFallbackContext = (e) => {
	_fallbackContext = e;
}, getFallbackContext = () => _fallbackContext, _cid = 0;
function createCoreContext(e = {}) {
	let t = isFunction$1(e.onWarn) ? e.onWarn : warn, n = isString$1(e.version) ? e.version : VERSION$1, r = isString$1(e.locale) || isFunction$1(e.locale) ? e.locale : DEFAULT_LOCALE, i = isFunction$1(r) ? DEFAULT_LOCALE : r, a = isArray$1(e.fallbackLocale) || isPlainObject(e.fallbackLocale) || isString$1(e.fallbackLocale) || e.fallbackLocale === !1 ? e.fallbackLocale : i, o = isPlainObject(e.messages) ? e.messages : createResources(i), s = isPlainObject(e.datetimeFormats) ? e.datetimeFormats : createResources(i), c = isPlainObject(e.numberFormats) ? e.numberFormats : createResources(i), l = assign(create(), e.modifiers, getDefaultLinkedModifiers()), u = e.pluralRules || create(), d = isFunction$1(e.missing) ? e.missing : null, f = isBoolean$1(e.missingWarn) || isRegExp(e.missingWarn) ? e.missingWarn : !0, p = isBoolean$1(e.fallbackWarn) || isRegExp(e.fallbackWarn) ? e.fallbackWarn : !0, m = !!e.fallbackFormat, g = !!e.unresolving, _ = isFunction$1(e.postTranslation) ? e.postTranslation : null, v = isPlainObject(e.processor) ? e.processor : null, y = isBoolean$1(e.warnHtmlMessage) ? e.warnHtmlMessage : !0, b = !!e.escapeParameter, x = isFunction$1(e.messageCompiler) ? e.messageCompiler : _compiler;
	process.env.NODE_ENV !== "production" && isFunction$1(e.messageCompiler) && warnOnce(getWarnMessage$1(CoreWarnCodes.EXPERIMENTAL_CUSTOM_MESSAGE_COMPILER));
	let S = isFunction$1(e.messageResolver) ? e.messageResolver : _resolver || resolveWithKeyValue, C = isFunction$1(e.localeFallbacker) ? e.localeFallbacker : _fallbacker || fallbackWithSimple, w = isObject$1(e.fallbackContext) ? e.fallbackContext : void 0, T = e, E = isObject$1(T.__datetimeFormatters) ? T.__datetimeFormatters : /* @__PURE__ */ new Map(), D = isObject$1(T.__numberFormatters) ? T.__numberFormatters : /* @__PURE__ */ new Map(), O = isObject$1(T.__meta) ? T.__meta : {};
	_cid++;
	let k = {
		version: n,
		cid: _cid,
		locale: r,
		fallbackLocale: a,
		messages: o,
		modifiers: l,
		pluralRules: u,
		missing: d,
		missingWarn: f,
		fallbackWarn: p,
		fallbackFormat: m,
		unresolving: g,
		postTranslation: _,
		processor: v,
		warnHtmlMessage: y,
		escapeParameter: b,
		messageCompiler: x,
		messageResolver: S,
		localeFallbacker: C,
		fallbackContext: w,
		onWarn: t,
		__meta: O
	};
	return k.datetimeFormats = s, k.numberFormats = c, k.__datetimeFormatters = E, k.__numberFormatters = D, process.env.NODE_ENV !== "production" && (k.__v_emitter = T.__v_emitter == null ? void 0 : T.__v_emitter), (process.env.NODE_ENV !== "production" || __INTLIFY_PROD_DEVTOOLS__) && initI18nDevTools(k, n, O), k;
}
var createResources = (e) => ({ [e]: create() });
function isTranslateFallbackWarn(e, t) {
	return e instanceof RegExp ? e.test(t) : e;
}
function isTranslateMissingWarn(e, t) {
	return e instanceof RegExp ? e.test(t) : e;
}
function handleMissing(e, t, n, r, i) {
	let { missing: a, onWarn: o } = e;
	if (process.env.NODE_ENV !== "production") {
		let r = e.__v_emitter;
		r && r.emit("missing", {
			locale: n,
			key: t,
			type: i,
			groupId: `${i}:${t}`
		});
	}
	if (a !== null) {
		let r = a(e, n, t, i);
		return isString$1(r) ? r : t;
	} else return process.env.NODE_ENV !== "production" && isTranslateMissingWarn(r, t) && o(getWarnMessage$1(CoreWarnCodes.NOT_FOUND_KEY, {
		key: t,
		locale: n
	})), t;
}
function updateFallbackLocale(e, t, n) {
	let r = e;
	r.__localeChainCache = /* @__PURE__ */ new Map(), e.localeFallbacker(e, n, t);
}
function isAlmostSameLocale(e, t) {
	return e === t ? !1 : e.split("-")[0] === t.split("-")[0];
}
function isImplicitFallback(e, t) {
	let n = t.indexOf(e);
	if (n === -1) return !1;
	for (let r = n + 1; r < t.length; r++) if (isAlmostSameLocale(e, t[r])) return !0;
	return !1;
}
var intlDefined = typeof Intl < "u", Availabilities = {
	dateTimeFormat: intlDefined && Intl.DateTimeFormat !== void 0,
	numberFormat: intlDefined && Intl.NumberFormat !== void 0
};
function datetime(e, ...t) {
	let { datetimeFormats: n, unresolving: r, fallbackLocale: i, onWarn: a, localeFallbacker: o } = e, { __datetimeFormatters: s } = e;
	if (process.env.NODE_ENV !== "production" && !Availabilities.dateTimeFormat) return a(getWarnMessage$1(CoreWarnCodes.CANNOT_FORMAT_DATE)), "";
	let [c, l, u, d] = parseDateTimeArgs(...t), f = isBoolean$1(u.missingWarn) ? u.missingWarn : e.missingWarn, p = isBoolean$1(u.fallbackWarn) ? u.fallbackWarn : e.fallbackWarn, m = !!u.part, g = getLocale(e, u), _ = o(e, i, g);
	if (!isString$1(c) || c === "") return new Intl.DateTimeFormat(g, d).format(l);
	let v = {}, y, b = null, x = g, S = null, C = "datetime format";
	for (let t = 0; t < _.length; t++) {
		if (y = S = _[t], process.env.NODE_ENV !== "production" && g !== y && isTranslateFallbackWarn(p, c) && a(getWarnMessage$1(CoreWarnCodes.FALLBACK_TO_DATE_FORMAT, {
			key: c,
			target: y
		})), process.env.NODE_ENV !== "production" && g !== y) {
			let t = e.__v_emitter;
			t && t.emit("fallback", {
				type: C,
				key: c,
				from: x,
				to: S,
				groupId: `${C}:${c}`
			});
		}
		if (v = n[y] || {}, b = v[c], isPlainObject(b)) break;
		handleMissing(e, c, y, f, C), x = S;
	}
	if (!isPlainObject(b) || !isString$1(y)) return r ? -1 : c;
	let w = `${y}__${c}`;
	isEmptyObject(d) || (w = `${w}__${JSON.stringify(d)}`);
	let T = s.get(w);
	return T || (T = new Intl.DateTimeFormat(y, assign({}, b, d)), s.set(w, T)), m ? T.formatToParts(l) : T.format(l);
}
var DATETIME_FORMAT_OPTIONS_KEYS = [
	"localeMatcher",
	"weekday",
	"era",
	"year",
	"month",
	"day",
	"hour",
	"minute",
	"second",
	"timeZoneName",
	"formatMatcher",
	"hour12",
	"timeZone",
	"dateStyle",
	"timeStyle",
	"calendar",
	"dayPeriod",
	"numberingSystem",
	"hourCycle",
	"fractionalSecondDigits"
];
function parseDateTimeArgs(...e) {
	let [t, n, r, i] = e, a = create(), o = create(), s;
	if (isString$1(t)) {
		let e = t.match(/(\d{4}-\d{2}-\d{2})(T|\s)?(.*)/);
		if (!e) throw createCoreError(CoreErrorCodes.INVALID_ISO_DATE_ARGUMENT);
		let n = e[3] ? e[3].trim().startsWith("T") ? `${e[1].trim()}${e[3].trim()}` : `${e[1].trim()}T${e[3].trim()}` : e[1].trim();
		s = new Date(n);
		try {
			s.toISOString();
		} catch {
			throw createCoreError(CoreErrorCodes.INVALID_ISO_DATE_ARGUMENT);
		}
	} else if (isDate(t)) {
		if (isNaN(t.getTime())) throw createCoreError(CoreErrorCodes.INVALID_DATE_ARGUMENT);
		s = t;
	} else if (isNumber$1(t)) s = t;
	else throw createCoreError(CoreErrorCodes.INVALID_ARGUMENT);
	return isString$1(n) ? a.key = n : isPlainObject(n) && Object.keys(n).forEach((e) => {
		DATETIME_FORMAT_OPTIONS_KEYS.includes(e) ? o[e] = n[e] : a[e] = n[e];
	}), isString$1(r) ? a.locale = r : isPlainObject(r) && (o = r), isPlainObject(i) && (o = i), [
		a.key || "",
		s,
		a,
		o
	];
}
function clearDateTimeFormat(e, t, n) {
	let r = e;
	for (let e in n) {
		let n = `${t}__${e}`;
		r.__datetimeFormatters.has(n) && r.__datetimeFormatters.delete(n);
	}
}
function number(e, ...t) {
	let { numberFormats: n, unresolving: r, fallbackLocale: i, onWarn: a, localeFallbacker: o } = e, { __numberFormatters: s } = e;
	if (process.env.NODE_ENV !== "production" && !Availabilities.numberFormat) return a(getWarnMessage$1(CoreWarnCodes.CANNOT_FORMAT_NUMBER)), "";
	let [c, l, u, d] = parseNumberArgs(...t), f = isBoolean$1(u.missingWarn) ? u.missingWarn : e.missingWarn, p = isBoolean$1(u.fallbackWarn) ? u.fallbackWarn : e.fallbackWarn, m = !!u.part, g = getLocale(e, u), _ = o(e, i, g);
	if (!isString$1(c) || c === "") return new Intl.NumberFormat(g, d).format(l);
	let v = {}, y, b = null, x = g, S = null, C = "number format";
	for (let t = 0; t < _.length; t++) {
		if (y = S = _[t], process.env.NODE_ENV !== "production" && g !== y && isTranslateFallbackWarn(p, c) && a(getWarnMessage$1(CoreWarnCodes.FALLBACK_TO_NUMBER_FORMAT, {
			key: c,
			target: y
		})), process.env.NODE_ENV !== "production" && g !== y) {
			let t = e.__v_emitter;
			t && t.emit("fallback", {
				type: C,
				key: c,
				from: x,
				to: S,
				groupId: `${C}:${c}`
			});
		}
		if (v = n[y] || {}, b = v[c], isPlainObject(b)) break;
		handleMissing(e, c, y, f, C), x = S;
	}
	if (!isPlainObject(b) || !isString$1(y)) return r ? -1 : c;
	let w = `${y}__${c}`;
	isEmptyObject(d) || (w = `${w}__${JSON.stringify(d)}`);
	let T = s.get(w);
	return T || (T = new Intl.NumberFormat(y, assign({}, b, d)), s.set(w, T)), m ? T.formatToParts(l) : T.format(l);
}
var NUMBER_FORMAT_OPTIONS_KEYS = [
	"localeMatcher",
	"style",
	"currency",
	"currencyDisplay",
	"currencySign",
	"useGrouping",
	"minimumIntegerDigits",
	"minimumFractionDigits",
	"maximumFractionDigits",
	"minimumSignificantDigits",
	"maximumSignificantDigits",
	"compactDisplay",
	"notation",
	"signDisplay",
	"unit",
	"unitDisplay",
	"roundingMode",
	"roundingPriority",
	"roundingIncrement",
	"trailingZeroDisplay"
];
function parseNumberArgs(...e) {
	let [t, n, r, i] = e, a = create(), o = create();
	if (!isNumber$1(t)) throw createCoreError(CoreErrorCodes.INVALID_ARGUMENT);
	let s = t;
	return isString$1(n) ? a.key = n : isPlainObject(n) && Object.keys(n).forEach((e) => {
		NUMBER_FORMAT_OPTIONS_KEYS.includes(e) ? o[e] = n[e] : a[e] = n[e];
	}), isString$1(r) ? a.locale = r : isPlainObject(r) && (o = r), isPlainObject(i) && (o = i), [
		a.key || "",
		s,
		a,
		o
	];
}
function clearNumberFormat(e, t, n) {
	let r = e;
	for (let e in n) {
		let n = `${t}__${e}`;
		r.__numberFormatters.has(n) && r.__numberFormatters.delete(n);
	}
}
var DEFAULT_MODIFIER = (e) => e, DEFAULT_MESSAGE = (e) => "", DEFAULT_MESSAGE_DATA_TYPE = "text", DEFAULT_NORMALIZE = (e) => e.length === 0 ? "" : join(e), DEFAULT_INTERPOLATE = toDisplayString;
function pluralDefault(e, t) {
	return e = Math.abs(e), t === 2 ? e ? e > 1 ? 1 : 0 : 1 : e ? Math.min(e, 2) : 0;
}
function getPluralIndex(e) {
	let t = isNumber$1(e.pluralIndex) ? e.pluralIndex : -1;
	return e.named && (isNumber$1(e.named.count) || isNumber$1(e.named.n)) ? isNumber$1(e.named.count) ? e.named.count : isNumber$1(e.named.n) ? e.named.n : t : t;
}
function normalizeNamed(e, t) {
	t.count ||= e, t.n ||= e;
}
function createMessageContext(e = {}) {
	let t = e.locale, n = getPluralIndex(e), r = isObject$1(e.pluralRules) && isString$1(t) && isFunction$1(e.pluralRules[t]) ? e.pluralRules[t] : pluralDefault, i = isObject$1(e.pluralRules) && isString$1(t) && isFunction$1(e.pluralRules[t]) ? pluralDefault : void 0, a = (e) => e[r(n, e.length, i)], o = e.list || [], s = (e) => o[e], c = e.named || create();
	isNumber$1(e.pluralIndex) && normalizeNamed(n, c);
	let l = (e) => c[e];
	function u(t, n) {
		return (isFunction$1(e.messages) ? e.messages(t, !!n) : isObject$1(e.messages) ? e.messages[t] : !1) || (e.parent ? e.parent.message(t) : DEFAULT_MESSAGE);
	}
	let d = (t) => e.modifiers ? e.modifiers[t] : DEFAULT_MODIFIER, f = isPlainObject(e.processor) && isFunction$1(e.processor.normalize) ? e.processor.normalize : DEFAULT_NORMALIZE, p = isPlainObject(e.processor) && isFunction$1(e.processor.interpolate) ? e.processor.interpolate : DEFAULT_INTERPOLATE, m = {
		list: s,
		named: l,
		plural: a,
		linked: (e, ...t) => {
			let [n, r] = t, i = "text", a = "";
			t.length === 1 ? isObject$1(n) ? (a = n.modifier || a, i = n.type || i) : isString$1(n) && (a = n || a) : t.length === 2 && (isString$1(n) && (a = n || a), isString$1(r) && (i = r || i));
			let o = u(e, !0)(m), s = i === "vnode" && isArray$1(o) && a ? o[0] : o;
			return a ? d(a)(s, i) : s;
		},
		message: u,
		type: isPlainObject(e.processor) && isString$1(e.processor.type) ? e.processor.type : DEFAULT_MESSAGE_DATA_TYPE,
		interpolate: p,
		normalize: f,
		values: assign(create(), o, c)
	};
	return m;
}
var NOOP_MESSAGE_FUNCTION = () => "", isMessageFunction = (e) => isFunction$1(e);
function translate(e, ...t) {
	let { fallbackFormat: n, postTranslation: r, unresolving: i, messageCompiler: a, fallbackLocale: o, messages: s } = e, [c, l] = parseTranslateArgs(...t), u = isBoolean$1(l.missingWarn) ? l.missingWarn : e.missingWarn, d = isBoolean$1(l.fallbackWarn) ? l.fallbackWarn : e.fallbackWarn, f = isBoolean$1(l.escapeParameter) ? l.escapeParameter : e.escapeParameter, p = !!l.resolvedMessage, m = isString$1(l.default) || isBoolean$1(l.default) ? isBoolean$1(l.default) ? a ? c : () => c : l.default : n ? a ? c : () => c : null, g = n || m != null && (isString$1(m) || isFunction$1(m)), _ = getLocale(e, l);
	f && escapeParams(l);
	let [v, y, b] = p ? [
		c,
		_,
		s[_] || create()
	] : resolveMessageFormat(e, c, _, o, d, u), x = v, S = c;
	if (!p && !(isString$1(x) || isMessageAST(x) || isMessageFunction(x)) && g && (x = m, S = x), !p && (!(isString$1(x) || isMessageAST(x) || isMessageFunction(x)) || !isString$1(y))) return i ? -1 : c;
	if (process.env.NODE_ENV !== "production" && isString$1(x) && e.messageCompiler == null) return warn(`The message format compilation is not supported in this build. Because message compiler isn't included. You need to pre-compilation all message format. So translate function return '${c}'.`), c;
	let C = !1, w = isMessageFunction(x) ? x : compileMessageFormat(e, c, y, x, S, () => {
		C = !0;
	});
	if (C) return x;
	let T = evaluateMessage(e, w, createMessageContext(getMessageContextOptions(e, y, b, l))), E = r ? r(T, c) : T;
	if (f && isString$1(E) && (E = sanitizeTranslatedHtml(E)), process.env.NODE_ENV !== "production" || __INTLIFY_PROD_DEVTOOLS__) {
		let t = {
			timestamp: Date.now(),
			key: isString$1(c) ? c : isMessageFunction(x) ? x.key : "",
			locale: y || (isMessageFunction(x) ? x.locale : ""),
			format: isString$1(x) ? x : isMessageFunction(x) ? x.source : "",
			message: E
		};
		t.meta = assign({}, e.__meta, /* @__PURE__ */ getAdditionalMeta() || {}), translateDevTools(t);
	}
	return E;
}
function escapeParams(e) {
	isArray$1(e.list) ? e.list = e.list.map((e) => isString$1(e) ? escapeHtml(e) : e) : isObject$1(e.named) && Object.keys(e.named).forEach((t) => {
		isString$1(e.named[t]) && (e.named[t] = escapeHtml(e.named[t]));
	});
}
function resolveMessageFormat(e, t, n, r, i, a) {
	let { messages: o, onWarn: s, messageResolver: c, localeFallbacker: l } = e, u = l(e, r, n), d = create(), f, p = null, m = n, g = null, _ = "translate";
	for (let r = 0; r < u.length; r++) {
		if (f = g = u[r], process.env.NODE_ENV !== "production" && n !== f && !isAlmostSameLocale(n, f) && isTranslateFallbackWarn(i, t) && s(getWarnMessage$1(CoreWarnCodes.FALLBACK_TO_TRANSLATE, {
			key: t,
			target: f
		})), process.env.NODE_ENV !== "production" && n !== f) {
			let n = e.__v_emitter;
			n && n.emit("fallback", {
				type: _,
				key: t,
				from: m,
				to: g,
				groupId: `${_}:${t}`
			});
		}
		d = o[f] || create();
		let l = null, v, y;
		if (process.env.NODE_ENV !== "production" && inBrowser && (l = window.performance.now(), v = "intlify-message-resolve-start", y = "intlify-message-resolve-end", mark && mark(v)), (p = c(d, t)) === null && (p = d[t]), process.env.NODE_ENV !== "production" && inBrowser) {
			let n = window.performance.now(), r = e.__v_emitter;
			r && l && p && r.emit("message-resolve", {
				type: "message-resolve",
				key: t,
				message: p,
				time: n - l,
				groupId: `${_}:${t}`
			}), v && y && mark && measure && (mark(y), measure("intlify message resolve", v, y));
		}
		if (isString$1(p) || isMessageAST(p) || isMessageFunction(p)) break;
		if (!isImplicitFallback(f, u)) {
			let n = handleMissing(e, t, f, a, _);
			n !== t && (p = n);
		}
		m = g;
	}
	return [
		p,
		f,
		d
	];
}
function compileMessageFormat(e, t, n, r, i, a) {
	let { messageCompiler: o, warnHtmlMessage: s } = e;
	if (isMessageFunction(r)) {
		let e = r;
		return e.locale = e.locale || n, e.key = e.key || t, e;
	}
	if (o == null) {
		let e = (() => r);
		return e.locale = n, e.key = t, e;
	}
	let c = null, l, u;
	process.env.NODE_ENV !== "production" && inBrowser && (c = window.performance.now(), l = "intlify-message-compilation-start", u = "intlify-message-compilation-end", mark && mark(l));
	let d = o(r, getCompileContext(e, n, i, r, s, a));
	if (process.env.NODE_ENV !== "production" && inBrowser) {
		let n = window.performance.now(), i = e.__v_emitter;
		i && c && i.emit("message-compilation", {
			type: "message-compilation",
			message: r,
			time: n - c,
			groupId: `translate:${t}`
		}), l && u && mark && measure && (mark(u), measure("intlify message compilation", l, u));
	}
	return d.locale = n, d.key = t, d.source = r, d;
}
function evaluateMessage(e, t, n) {
	let r = null, i, a;
	process.env.NODE_ENV !== "production" && inBrowser && (r = window.performance.now(), i = "intlify-message-evaluation-start", a = "intlify-message-evaluation-end", mark && mark(i));
	let o = t(n);
	if (process.env.NODE_ENV !== "production" && inBrowser) {
		let n = window.performance.now(), s = e.__v_emitter;
		s && r && s.emit("message-evaluation", {
			type: "message-evaluation",
			value: o,
			time: n - r,
			groupId: `translate:${t.key}`
		}), i && a && mark && measure && (mark(a), measure("intlify message evaluation", i, a));
	}
	return o;
}
function parseTranslateArgs(...e) {
	let [t, n, r] = e, i = create();
	if (!isString$1(t) && !isNumber$1(t) && !isMessageFunction(t) && !isMessageAST(t)) throw createCoreError(CoreErrorCodes.INVALID_ARGUMENT);
	let a = isNumber$1(t) ? String(t) : (isMessageFunction(t), t);
	return isNumber$1(n) ? i.plural = n : isString$1(n) ? i.default = n : isPlainObject(n) && !isEmptyObject(n) ? i.named = n : isArray$1(n) && (i.list = n), isNumber$1(r) ? i.plural = r : isString$1(r) ? i.default = r : isPlainObject(r) && assign(i, r), [a, i];
}
function getCompileContext(e, t, n, r, i, a) {
	return {
		locale: t,
		key: n,
		warnHtmlMessage: i,
		onError: (t) => {
			if (a && a(t), process.env.NODE_ENV !== "production") {
				let i = getSourceForCodeFrame(r), a = `Message compilation error: ${t.message}`, o = t.location && i && generateCodeFrame(i, t.location.start.offset, t.location.end.offset), s = e.__v_emitter;
				s && i && s.emit("compile-error", {
					message: i,
					error: t.message,
					start: t.location && t.location.start.offset,
					end: t.location && t.location.end.offset,
					groupId: `translate:${n}`
				}), console.error(o ? `${a}\n${o}` : a);
			} else throw t;
		},
		onCacheKey: (e) => generateFormatCacheKey(t, n, e)
	};
}
function getSourceForCodeFrame(e) {
	if (isString$1(e)) return e;
	if (e.loc && e.loc.source) return e.loc.source;
}
function getMessageContextOptions(e, t, n, r) {
	let { modifiers: i, pluralRules: a, messageResolver: o, fallbackLocale: s, fallbackWarn: c, missingWarn: l, fallbackContext: u } = e, d = {
		locale: t,
		modifiers: i,
		pluralRules: a,
		messages: (r, i) => {
			let a = o(n, r);
			if (a == null && (u || i)) {
				let [, , n] = resolveMessageFormat(u || e, r, t, s, c, l);
				a = o(n, r);
			}
			if (isString$1(a) || isMessageAST(a)) {
				let n = !1, i = compileMessageFormat(e, r, t, a, r, () => {
					n = !0;
				});
				return n ? NOOP_MESSAGE_FUNCTION : i;
			} else if (isMessageFunction(a)) return a;
			else return NOOP_MESSAGE_FUNCTION;
		}
	};
	return e.processor && (d.processor = e.processor), r.list && (d.list = r.list), r.named && (d.named = r.named), isNumber$1(r.plural) && (d.pluralIndex = r.plural), d;
}
initFeatureFlags$1();
function getDevtoolsGlobalHook() {
	return getTarget().__VUE_DEVTOOLS_GLOBAL_HOOK__;
}
function getTarget() {
	return typeof navigator < "u" && typeof window < "u" ? window : typeof globalThis < "u" ? globalThis : {};
}
const isProxyAvailable = typeof Proxy == "function";
var supported, perf;
function isPerformanceSupported() {
	return supported === void 0 && (typeof window < "u" && window.performance ? (supported = !0, perf = window.performance) : typeof globalThis < "u" && globalThis.perf_hooks?.performance ? (supported = !0, perf = globalThis.perf_hooks.performance) : supported = !1), supported;
}
function now() {
	return isPerformanceSupported() ? perf.now() : Date.now();
}
var ApiProxy = class {
	constructor(e, t) {
		this.target = null, this.targetQueue = [], this.onQueue = [], this.plugin = e, this.hook = t;
		let n = {};
		if (e.settings) for (let t in e.settings) n[t] = e.settings[t].defaultValue;
		let r = `__vue-devtools-plugin-settings__${e.id}`, i = Object.assign({}, n);
		try {
			let e = localStorage.getItem(r), t = JSON.parse(e);
			Object.assign(i, t);
		} catch {}
		this.fallbacks = {
			getSettings() {
				return i;
			},
			setSettings(e) {
				try {
					localStorage.setItem(r, JSON.stringify(e));
				} catch {}
				i = e;
			},
			now() {
				return now();
			}
		}, t && t.on("plugin:settings:set", (e, t) => {
			e === this.plugin.id && this.fallbacks.setSettings(t);
		}), this.proxiedOn = new Proxy({}, { get: (e, t) => this.target ? this.target.on[t] : (...e) => {
			this.onQueue.push({
				method: t,
				args: e
			});
		} }), this.proxiedTarget = new Proxy({}, { get: (e, t) => this.target ? this.target[t] : t === "on" ? this.proxiedOn : Object.keys(this.fallbacks).includes(t) ? (...e) => (this.targetQueue.push({
			method: t,
			args: e,
			resolve: () => {}
		}), this.fallbacks[t](...e)) : (...e) => new Promise((n) => {
			this.targetQueue.push({
				method: t,
				args: e,
				resolve: n
			});
		}) });
	}
	async setRealTarget(e) {
		this.target = e;
		for (let e of this.onQueue) this.target.on[e.method](...e.args);
		for (let e of this.targetQueue) e.resolve(await this.target[e.method](...e.args));
	}
};
function setupDevtoolsPlugin(e, t) {
	let n = e, r = getTarget(), i = getDevtoolsGlobalHook(), a = isProxyAvailable && n.enableEarlyProxy;
	if (i && (r.__VUE_DEVTOOLS_PLUGIN_API_AVAILABLE__ || !a)) i.emit("devtools-plugin:setup", e, t);
	else {
		let e = a ? new ApiProxy(n, i) : null;
		(r.__VUE_DEVTOOLS_PLUGINS__ = r.__VUE_DEVTOOLS_PLUGINS__ || []).push({
			pluginDescriptor: n,
			setupFn: t,
			proxy: e
		}), e && t(e.proxiedTarget);
	}
}
var VERSION = "11.1.11";
function initFeatureFlags() {
	typeof __VUE_I18N_FULL_INSTALL__ != "boolean" && (getGlobalThis().__VUE_I18N_FULL_INSTALL__ = !0), typeof __VUE_I18N_LEGACY_API__ != "boolean" && (getGlobalThis().__VUE_I18N_LEGACY_API__ = !0), typeof __INTLIFY_DROP_MESSAGE_COMPILER__ != "boolean" && (getGlobalThis().__INTLIFY_DROP_MESSAGE_COMPILER__ = !1), typeof __INTLIFY_PROD_DEVTOOLS__ != "boolean" && (getGlobalThis().__INTLIFY_PROD_DEVTOOLS__ = !1);
}
var I18nErrorCodes = {
	UNEXPECTED_RETURN_TYPE: 24,
	INVALID_ARGUMENT: 25,
	MUST_BE_CALL_SETUP_TOP: 26,
	NOT_INSTALLED: 27,
	REQUIRED_VALUE: 28,
	INVALID_VALUE: 29,
	CANNOT_SETUP_VUE_DEVTOOLS_PLUGIN: 30,
	NOT_INSTALLED_WITH_PROVIDE: 31,
	UNEXPECTED_ERROR: 32,
	NOT_COMPATIBLE_LEGACY_VUE_I18N: 33,
	NOT_AVAILABLE_COMPOSITION_IN_LEGACY: 34
};
function createI18nError(e, ...t) {
	return createCompileError(e, null, process.env.NODE_ENV === "production" ? void 0 : {
		messages: errorMessages,
		args: t
	});
}
var errorMessages = {
	[I18nErrorCodes.UNEXPECTED_RETURN_TYPE]: "Unexpected return type in composer",
	[I18nErrorCodes.INVALID_ARGUMENT]: "Invalid argument",
	[I18nErrorCodes.MUST_BE_CALL_SETUP_TOP]: "Must be called at the top of a `setup` function",
	[I18nErrorCodes.NOT_INSTALLED]: "Need to install with `app.use` function",
	[I18nErrorCodes.UNEXPECTED_ERROR]: "Unexpected error",
	[I18nErrorCodes.REQUIRED_VALUE]: "Required in value: {0}",
	[I18nErrorCodes.INVALID_VALUE]: "Invalid value",
	[I18nErrorCodes.CANNOT_SETUP_VUE_DEVTOOLS_PLUGIN]: "Cannot setup vue-devtools plugin",
	[I18nErrorCodes.NOT_INSTALLED_WITH_PROVIDE]: "Need to install with `provide` function",
	[I18nErrorCodes.NOT_COMPATIBLE_LEGACY_VUE_I18N]: "Not compatible legacy VueI18n.",
	[I18nErrorCodes.NOT_AVAILABLE_COMPOSITION_IN_LEGACY]: "Not available Compostion API in Legacy API mode. Please make sure that the legacy API mode is working properly"
}, TranslateVNodeSymbol = /* @__PURE__ */ makeSymbol("__translateVNode"), DatetimePartsSymbol = /* @__PURE__ */ makeSymbol("__datetimeParts"), NumberPartsSymbol = /* @__PURE__ */ makeSymbol("__numberParts"), EnableEmitter = /* @__PURE__ */ makeSymbol("__enableEmitter"), DisableEmitter = /* @__PURE__ */ makeSymbol("__disableEmitter"), SetPluralRulesSymbol = makeSymbol("__setPluralRules");
makeSymbol("__intlifyMeta");
var InejctWithOptionSymbol = /* @__PURE__ */ makeSymbol("__injectWithOption"), DisposeSymbol = /* @__PURE__ */ makeSymbol("__dispose"), I18nWarnCodes = {
	FALLBACK_TO_ROOT: 8,
	NOT_FOUND_PARENT_SCOPE: 9,
	IGNORE_OBJ_FLATTEN: 10,
	DEPRECATE_LEGACY_MODE: 11,
	DEPRECATE_TRANSLATE_CUSTOME_DIRECTIVE: 12,
	DUPLICATE_USE_I18N_CALLING: 13
}, warnMessages = {
	[I18nWarnCodes.FALLBACK_TO_ROOT]: "Fall back to {type} '{key}' with root locale.",
	[I18nWarnCodes.NOT_FOUND_PARENT_SCOPE]: "Not found parent scope. use the global scope.",
	[I18nWarnCodes.IGNORE_OBJ_FLATTEN]: "Ignore object flatten: '{key}' key has an string value",
	[I18nWarnCodes.DEPRECATE_LEGACY_MODE]: "Legacy API mode has been deprecated in v11. Use Composition API mode instead.\nAbout how to use the Composition API mode, see https://vue-i18n.intlify.dev/guide/advanced/composition.html",
	[I18nWarnCodes.DEPRECATE_TRANSLATE_CUSTOME_DIRECTIVE]: "'v-t' has been deprecated in v11. Use translate APIs ('t' or '$t') instead.",
	[I18nWarnCodes.DUPLICATE_USE_I18N_CALLING]: "Duplicate `useI18n` calling by local scope. Please don't call it on local scope, due to it does not work properly in component."
};
function getWarnMessage(e, ...t) {
	return format(warnMessages[e], ...t);
}
function handleFlatJson(e) {
	if (!isObject$1(e) || isMessageAST(e)) return e;
	for (let t in e) if (hasOwn(e, t)) if (!t.includes(".")) isObject$1(e[t]) && handleFlatJson(e[t]);
	else {
		let n = t.split("."), r = n.length - 1, i = e, a = !1;
		for (let e = 0; e < r; e++) {
			if (n[e] === "__proto__") throw Error(`unsafe key: ${n[e]}`);
			if (n[e] in i || (i[n[e]] = create()), !isObject$1(i[n[e]])) {
				process.env.NODE_ENV !== "production" && warn(getWarnMessage(I18nWarnCodes.IGNORE_OBJ_FLATTEN, { key: n[e] })), a = !0;
				break;
			}
			i = i[n[e]];
		}
		if (a || (isMessageAST(i) ? AST_NODE_PROPS_KEYS.includes(n[r]) || delete e[t] : (i[n[r]] = e[t], delete e[t])), !isMessageAST(i)) {
			let e = i[n[r]];
			isObject$1(e) && handleFlatJson(e);
		}
	}
	return e;
}
function getLocaleMessages(e, t) {
	let { messages: n, __i18n: r, messageResolver: i, flatJson: a } = t, o = isPlainObject(n) ? n : isArray$1(r) ? create() : { [e]: create() };
	if (isArray$1(r) && r.forEach((e) => {
		if ("locale" in e && "resource" in e) {
			let { locale: t, resource: n } = e;
			t ? (o[t] = o[t] || create(), deepCopy(n, o[t])) : deepCopy(n, o);
		} else isString$1(e) && deepCopy(JSON.parse(e), o);
	}), i == null && a) for (let e in o) hasOwn(o, e) && handleFlatJson(o[e]);
	return o;
}
function getComponentOptions(e) {
	return e.type;
}
function adjustI18nResources(e, t, n) {
	let r = isObject$1(t.messages) ? t.messages : create();
	"__i18nGlobal" in n && (r = getLocaleMessages(e.locale.value, {
		messages: r,
		__i18n: n.__i18nGlobal
	}));
	let i = Object.keys(r);
	if (i.length && i.forEach((t) => {
		e.mergeLocaleMessage(t, r[t]);
	}), isObject$1(t.datetimeFormats)) {
		let n = Object.keys(t.datetimeFormats);
		n.length && n.forEach((n) => {
			e.mergeDateTimeFormat(n, t.datetimeFormats[n]);
		});
	}
	if (isObject$1(t.numberFormats)) {
		let n = Object.keys(t.numberFormats);
		n.length && n.forEach((n) => {
			e.mergeNumberFormat(n, t.numberFormats[n]);
		});
	}
}
function createTextNode(e) {
	return createVNode(Text, null, e, 0);
}
var NOOP_RETURN_ARRAY = () => [], NOOP_RETURN_FALSE = () => !1, composerID = 0;
function defineCoreMissingHandler(e) {
	return ((t, n, r, i) => e(n, r, getCurrentInstance() || void 0, i));
}
function createComposer(e = {}) {
	let { __root: t, __injectWithOption: n } = e, i = t === void 0, a = e.flatJson, o = inBrowser ? ref : shallowRef, s = isBoolean$1(e.inheritLocale) ? e.inheritLocale : !0, c = o(t && s ? t.locale.value : isString$1(e.locale) ? e.locale : DEFAULT_LOCALE), l = o(t && s ? t.fallbackLocale.value : isString$1(e.fallbackLocale) || isArray$1(e.fallbackLocale) || isPlainObject(e.fallbackLocale) || e.fallbackLocale === !1 ? e.fallbackLocale : c.value), u = o(getLocaleMessages(c.value, e)), d = o(isPlainObject(e.datetimeFormats) ? e.datetimeFormats : { [c.value]: {} }), f = o(isPlainObject(e.numberFormats) ? e.numberFormats : { [c.value]: {} }), _ = t ? t.missingWarn : isBoolean$1(e.missingWarn) || isRegExp(e.missingWarn) ? e.missingWarn : !0, v = t ? t.fallbackWarn : isBoolean$1(e.fallbackWarn) || isRegExp(e.fallbackWarn) ? e.fallbackWarn : !0, y = t ? t.fallbackRoot : isBoolean$1(e.fallbackRoot) ? e.fallbackRoot : !0, b = !!e.fallbackFormat, x = isFunction$1(e.missing) ? e.missing : null, S = isFunction$1(e.missing) ? defineCoreMissingHandler(e.missing) : null, C = isFunction$1(e.postTranslation) ? e.postTranslation : null, w = t ? t.warnHtmlMessage : isBoolean$1(e.warnHtmlMessage) ? e.warnHtmlMessage : !0, T = !!e.escapeParameter, E = t ? t.modifiers : isPlainObject(e.modifiers) ? e.modifiers : {}, D = e.pluralRules || t && t.pluralRules, O;
	O = (() => {
		i && setFallbackContext(null);
		let t = {
			version: VERSION,
			locale: c.value,
			fallbackLocale: l.value,
			messages: u.value,
			modifiers: E,
			pluralRules: D,
			missing: S === null ? void 0 : S,
			missingWarn: _,
			fallbackWarn: v,
			fallbackFormat: b,
			unresolving: !0,
			postTranslation: C === null ? void 0 : C,
			warnHtmlMessage: w,
			escapeParameter: T,
			messageResolver: e.messageResolver,
			messageCompiler: e.messageCompiler,
			__meta: { framework: "vue" }
		};
		t.datetimeFormats = d.value, t.numberFormats = f.value, t.__datetimeFormatters = isPlainObject(O) ? O.__datetimeFormatters : void 0, t.__numberFormatters = isPlainObject(O) ? O.__numberFormatters : void 0, process.env.NODE_ENV !== "production" && (t.__v_emitter = isPlainObject(O) ? O.__v_emitter : void 0);
		let n = createCoreContext(t);
		return i && setFallbackContext(n), n;
	})(), updateFallbackLocale(O, c.value, l.value);
	function k() {
		return [
			c.value,
			l.value,
			u.value,
			d.value,
			f.value
		];
	}
	let A = computed({
		get: () => c.value,
		set: (e) => {
			O.locale = e, c.value = e;
		}
	}), j = computed({
		get: () => l.value,
		set: (e) => {
			O.fallbackLocale = e, l.value = e, updateFallbackLocale(O, c.value, e);
		}
	}), M = computed(() => u.value), jl = /* @__PURE__ */ computed(() => d.value), Ml = /* @__PURE__ */ computed(() => f.value);
	function N() {
		return isFunction$1(C) ? C : null;
	}
	function P(e) {
		C = e, O.postTranslation = e;
	}
	function F() {
		return x;
	}
	function I(e) {
		e !== null && (S = defineCoreMissingHandler(e)), x = e, O.missing = S;
	}
	function L(e, t) {
		return e !== "translate" || !t.resolvedMessage;
	}
	let R = (e, n, r, a, o, s) => {
		k();
		let c;
		try {
			process.env.NODE_ENV !== "production" || __INTLIFY_PROD_DEVTOOLS__, i || (O.fallbackContext = t ? getFallbackContext() : void 0), c = e(O);
		} finally {
			process.env.NODE_ENV !== "production" || __INTLIFY_PROD_DEVTOOLS__, i || (O.fallbackContext = void 0);
		}
		if (r !== "translate exists" && isNumber$1(c) && c === -1 || r === "translate exists" && !c) {
			let [e, i] = n();
			if (process.env.NODE_ENV !== "production" && t && isString$1(e) && L(r, i) && (y && (isTranslateFallbackWarn(v, e) || isTranslateMissingWarn(_, e)) && warn(getWarnMessage(I18nWarnCodes.FALLBACK_TO_ROOT, {
				key: e,
				type: r
			})), process.env.NODE_ENV !== "production")) {
				let { __v_emitter: t } = O;
				t && y && t.emit("fallback", {
					type: r,
					key: e,
					to: "global",
					groupId: `${r}:${e}`
				});
			}
			return t && y ? a(t) : o(e);
		} else if (s(c)) return c;
		else
 /* istanbul ignore next */
		throw createI18nError(I18nErrorCodes.UNEXPECTED_RETURN_TYPE);
	};
	function z(...e) {
		return R((t) => Reflect.apply(translate, null, [t, ...e]), () => parseTranslateArgs(...e), "translate", (t) => Reflect.apply(t.t, t, [...e]), (e) => e, (e) => isString$1(e));
	}
	function B(...e) {
		let [t, n, r] = e;
		if (r && !isObject$1(r)) throw createI18nError(I18nErrorCodes.INVALID_ARGUMENT);
		return z(t, n, assign({ resolvedMessage: !0 }, r || {}));
	}
	function V(...e) {
		return R((t) => Reflect.apply(datetime, null, [t, ...e]), () => parseDateTimeArgs(...e), "datetime format", (t) => Reflect.apply(t.d, t, [...e]), () => "", (e) => isString$1(e) || isArray$1(e));
	}
	function H(...e) {
		return R((t) => Reflect.apply(number, null, [t, ...e]), () => parseNumberArgs(...e), "number format", (t) => Reflect.apply(t.n, t, [...e]), () => "", (e) => isString$1(e) || isArray$1(e));
	}
	function U(e) {
		return e.map((e) => isString$1(e) || isNumber$1(e) || isBoolean$1(e) ? createTextNode(String(e)) : e);
	}
	let W = {
		normalize: U,
		interpolate: (e) => e,
		type: "vnode"
	};
	function G(...e) {
		return R((t) => {
			let n, r = t;
			try {
				r.processor = W, n = Reflect.apply(translate, null, [r, ...e]);
			} finally {
				r.processor = null;
			}
			return n;
		}, () => parseTranslateArgs(...e), "translate", (t) => t[TranslateVNodeSymbol](...e), (e) => [createTextNode(e)], (e) => isArray$1(e));
	}
	function K(...e) {
		return R((t) => Reflect.apply(number, null, [t, ...e]), () => parseNumberArgs(...e), "number format", (t) => t[NumberPartsSymbol](...e), NOOP_RETURN_ARRAY, (e) => isString$1(e) || isArray$1(e));
	}
	function q(...e) {
		return R((t) => Reflect.apply(datetime, null, [t, ...e]), () => parseDateTimeArgs(...e), "datetime format", (t) => t[DatetimePartsSymbol](...e), NOOP_RETURN_ARRAY, (e) => isString$1(e) || isArray$1(e));
	}
	function J(e) {
		D = e, O.pluralRules = D;
	}
	function Y(e, t) {
		return R(() => {
			if (!e) return !1;
			let n = Q(isString$1(t) ? t : c.value), r = O.messageResolver(n, e);
			return isMessageAST(r) || isMessageFunction(r) || isString$1(r);
		}, () => [e], "translate exists", (n) => Reflect.apply(n.te, n, [e, t]), NOOP_RETURN_FALSE, (e) => isBoolean$1(e));
	}
	function X(e) {
		let t = null, n = fallbackWithLocaleChain(O, l.value, c.value);
		for (let r = 0; r < n.length; r++) {
			let i = u.value[n[r]] || {}, a = O.messageResolver(i, e);
			if (a != null) {
				t = a;
				break;
			}
		}
		return t;
	}
	function Z(e) {
		return X(e) ?? (t && t.tm(e) || {});
	}
	function Q(e) {
		return u.value[e] || {};
	}
	function Nl(e, t) {
		if (a) {
			let n = { [e]: t };
			for (let e in n) hasOwn(n, e) && handleFlatJson(n[e]);
			t = n[e];
		}
		u.value[e] = t, O.messages = u.value;
	}
	function Pl(e, t) {
		u.value[e] = u.value[e] || {};
		let n = { [e]: t };
		if (a) for (let e in n) hasOwn(n, e) && handleFlatJson(n[e]);
		t = n[e], deepCopy(t, u.value[e]), O.messages = u.value;
	}
	function Fl(e) {
		return d.value[e] || {};
	}
	function Il(e, t) {
		d.value[e] = t, O.datetimeFormats = d.value, clearDateTimeFormat(O, e, t);
	}
	function Ll(e, t) {
		d.value[e] = assign(d.value[e] || {}, t), O.datetimeFormats = d.value, clearDateTimeFormat(O, e, t);
	}
	function Rl(e) {
		return f.value[e] || {};
	}
	function zl(e, t) {
		f.value[e] = t, O.numberFormats = f.value, clearNumberFormat(O, e, t);
	}
	function Bl(e, t) {
		f.value[e] = assign(f.value[e] || {}, t), O.numberFormats = f.value, clearNumberFormat(O, e, t);
	}
	composerID++, t && inBrowser && (watch(t.locale, (e) => {
		s && (c.value = e, O.locale = e, updateFallbackLocale(O, c.value, l.value));
	}), watch(t.fallbackLocale, (e) => {
		s && (l.value = e, O.fallbackLocale = e, updateFallbackLocale(O, c.value, l.value));
	}));
	let $ = {
		id: composerID,
		locale: A,
		fallbackLocale: j,
		get inheritLocale() {
			return s;
		},
		set inheritLocale(e) {
			s = e, e && t && (c.value = t.locale.value, l.value = t.fallbackLocale.value, updateFallbackLocale(O, c.value, l.value));
		},
		get availableLocales() {
			return Object.keys(u.value).sort();
		},
		messages: M,
		get modifiers() {
			return E;
		},
		get pluralRules() {
			return D || {};
		},
		get isGlobal() {
			return i;
		},
		get missingWarn() {
			return _;
		},
		set missingWarn(e) {
			_ = e, O.missingWarn = _;
		},
		get fallbackWarn() {
			return v;
		},
		set fallbackWarn(e) {
			v = e, O.fallbackWarn = v;
		},
		get fallbackRoot() {
			return y;
		},
		set fallbackRoot(e) {
			y = e;
		},
		get fallbackFormat() {
			return b;
		},
		set fallbackFormat(e) {
			b = e, O.fallbackFormat = b;
		},
		get warnHtmlMessage() {
			return w;
		},
		set warnHtmlMessage(e) {
			w = e, O.warnHtmlMessage = e;
		},
		get escapeParameter() {
			return T;
		},
		set escapeParameter(e) {
			T = e, O.escapeParameter = e;
		},
		t: z,
		getLocaleMessage: Q,
		setLocaleMessage: Nl,
		mergeLocaleMessage: Pl,
		getPostTranslationHandler: N,
		setPostTranslationHandler: P,
		getMissingHandler: F,
		setMissingHandler: I,
		[SetPluralRulesSymbol]: J
	};
	return $.datetimeFormats = jl, $.numberFormats = Ml, $.rt = B, $.te = Y, $.tm = Z, $.d = V, $.n = H, $.getDateTimeFormat = Fl, $.setDateTimeFormat = Il, $.mergeDateTimeFormat = Ll, $.getNumberFormat = Rl, $.setNumberFormat = zl, $.mergeNumberFormat = Bl, $[InejctWithOptionSymbol] = n, $[TranslateVNodeSymbol] = G, $[DatetimePartsSymbol] = q, $[NumberPartsSymbol] = K, process.env.NODE_ENV !== "production" && ($[EnableEmitter] = (e) => {
		O.__v_emitter = e;
	}, $[DisableEmitter] = () => {
		O.__v_emitter = void 0;
	}), $;
}
var VUE_I18N_COMPONENT_TYPES = "vue-i18n: composer properties", VueDevToolsLabels = {
	"vue-devtools-plugin-vue-i18n": "Vue I18n DevTools",
	"vue-i18n-resource-inspector": "Vue I18n DevTools",
	"vue-i18n-timeline": "Vue I18n"
}, VueDevToolsPlaceholders = { "vue-i18n-resource-inspector": "Search for scopes ..." }, VueDevToolsTimelineColors = { "vue-i18n-timeline": 16764185 }, devtoolsApi;
async function enableDevTools(e, t) {
	return new Promise((n, r) => {
		try {
			setupDevtoolsPlugin({
				id: "vue-devtools-plugin-vue-i18n",
				label: VueDevToolsLabels["vue-devtools-plugin-vue-i18n"],
				packageName: "vue-i18n",
				homepage: "https://vue-i18n.intlify.dev",
				logo: "https://vue-i18n.intlify.dev/vue-i18n-devtools-logo.png",
				componentStateTypes: [VUE_I18N_COMPONENT_TYPES],
				app: e
			}, (r) => {
				devtoolsApi = r, r.on.visitComponentTree(({ componentInstance: e, treeNode: n }) => {
					updateComponentTreeTags(e, n, t);
				}), r.on.inspectComponent(({ componentInstance: e, instanceData: n }) => {
					e.vnode.el && e.vnode.el.__VUE_I18N__ && n && (t.mode === "legacy" ? e.vnode.el.__VUE_I18N__ !== t.global.__composer && inspectComposer(n, e.vnode.el.__VUE_I18N__) : inspectComposer(n, e.vnode.el.__VUE_I18N__));
				}), r.addInspector({
					id: "vue-i18n-resource-inspector",
					label: VueDevToolsLabels["vue-i18n-resource-inspector"],
					icon: "language",
					treeFilterPlaceholder: VueDevToolsPlaceholders["vue-i18n-resource-inspector"]
				}), r.on.getInspectorTree((n) => {
					n.app === e && n.inspectorId === "vue-i18n-resource-inspector" && registerScope(n, t);
				});
				let i = /* @__PURE__ */ new Map();
				r.on.getInspectorState(async (n) => {
					if (n.app === e && n.inspectorId === "vue-i18n-resource-inspector") if (r.unhighlightElement(), inspectScope(n, t), n.nodeId === "global") {
						if (!i.has(n.app)) {
							let [e] = await r.getComponentInstances(n.app);
							i.set(n.app, e);
						}
						r.highlightElement(i.get(n.app));
					} else {
						let e = getComponentInstance(n.nodeId, t);
						e && r.highlightElement(e);
					}
				}), r.on.editInspectorState((n) => {
					n.app === e && n.inspectorId === "vue-i18n-resource-inspector" && editScope(n, t);
				}), r.addTimelineLayer({
					id: "vue-i18n-timeline",
					label: VueDevToolsLabels["vue-i18n-timeline"],
					color: VueDevToolsTimelineColors["vue-i18n-timeline"]
				}), n(!0);
			});
		} catch (e) {
			console.error(e), r(!1);
		}
	});
}
function getI18nScopeLable(e) {
	return e.type.name || e.type.displayName || e.type.__file || "Anonymous";
}
function updateComponentTreeTags(e, t, n) {
	let r = n.mode === "composition" ? n.global : n.global.__composer;
	if (e && e.vnode.el && e.vnode.el.__VUE_I18N__ && e.vnode.el.__VUE_I18N__ !== r) {
		let n = {
			label: `i18n (${getI18nScopeLable(e)} Scope)`,
			textColor: 0,
			backgroundColor: 16764185
		};
		t.tags.push(n);
	}
}
function inspectComposer(e, t) {
	let n = VUE_I18N_COMPONENT_TYPES;
	e.state.push({
		type: n,
		key: "locale",
		editable: !0,
		value: t.locale.value
	}), e.state.push({
		type: n,
		key: "availableLocales",
		editable: !1,
		value: t.availableLocales
	}), e.state.push({
		type: n,
		key: "fallbackLocale",
		editable: !0,
		value: t.fallbackLocale.value
	}), e.state.push({
		type: n,
		key: "inheritLocale",
		editable: !0,
		value: t.inheritLocale
	}), e.state.push({
		type: n,
		key: "messages",
		editable: !1,
		value: getLocaleMessageValue(t.messages.value)
	}), e.state.push({
		type: n,
		key: "datetimeFormats",
		editable: !1,
		value: t.datetimeFormats.value
	}), e.state.push({
		type: n,
		key: "numberFormats",
		editable: !1,
		value: t.numberFormats.value
	});
}
function getLocaleMessageValue(e) {
	let t = {};
	return Object.keys(e).forEach((n) => {
		let r = e[n];
		isFunction$1(r) && "source" in r ? t[n] = getMessageFunctionDetails(r) : isMessageAST(r) && r.loc && r.loc.source ? t[n] = r.loc.source : isObject$1(r) ? t[n] = getLocaleMessageValue(r) : t[n] = r;
	}), t;
}
var ESC = {
	"<": "&lt;",
	">": "&gt;",
	"\"": "&quot;",
	"&": "&amp;"
};
function escape(e) {
	return e.replace(/[<>"&]/g, escapeChar);
}
function escapeChar(e) {
	return ESC[e] || e;
}
function getMessageFunctionDetails(e) {
	return { _custom: {
		type: "function",
		display: `<span>ƒ</span> ${e.source ? `("${escape(e.source)}")` : "(?)"}`
	} };
}
function registerScope(e, t) {
	e.rootNodes.push({
		id: "global",
		label: "Global Scope"
	});
	let n = t.mode === "composition" ? t.global : t.global.__composer;
	for (let [r, i] of t.__instances) {
		let a = t.mode === "composition" ? i : i.__composer;
		n !== a && e.rootNodes.push({
			id: a.id.toString(),
			label: `${getI18nScopeLable(r)} Scope`
		});
	}
}
function getComponentInstance(e, t) {
	let n = null;
	if (e !== "global") {
		for (let [r, i] of t.__instances.entries()) if (i.id.toString() === e) {
			n = r;
			break;
		}
	}
	return n;
}
function getComposer$2(e, t) {
	if (e === "global") return t.mode === "composition" ? t.global : t.global.__composer;
	{
		let n = Array.from(t.__instances.values()).find((t) => t.id.toString() === e);
		return n ? t.mode === "composition" ? n : n.__composer : null;
	}
}
function inspectScope(e, t) {
	let n = getComposer$2(e.nodeId, t);
	return n && (e.state = makeScopeInspectState(n)), null;
}
function makeScopeInspectState(e) {
	let t = {}, n = "Locale related info";
	t[n] = [
		{
			type: n,
			key: "locale",
			editable: !0,
			value: e.locale.value
		},
		{
			type: n,
			key: "fallbackLocale",
			editable: !0,
			value: e.fallbackLocale.value
		},
		{
			type: n,
			key: "availableLocales",
			editable: !1,
			value: e.availableLocales
		},
		{
			type: n,
			key: "inheritLocale",
			editable: !0,
			value: e.inheritLocale
		}
	];
	let r = "Locale messages info";
	t[r] = [{
		type: r,
		key: "messages",
		editable: !1,
		value: getLocaleMessageValue(e.messages.value)
	}];
	{
		let n = "Datetime formats info";
		t[n] = [{
			type: n,
			key: "datetimeFormats",
			editable: !1,
			value: e.datetimeFormats.value
		}];
		let r = "Datetime formats info";
		t[r] = [{
			type: r,
			key: "numberFormats",
			editable: !1,
			value: e.numberFormats.value
		}];
	}
	return t;
}
function addTimelineEvent(e, t) {
	if (devtoolsApi) {
		let n;
		t && "groupId" in t && (n = t.groupId, delete t.groupId), devtoolsApi.addTimelineEvent({
			layerId: "vue-i18n-timeline",
			event: {
				title: e,
				groupId: n,
				time: Date.now(),
				meta: {},
				data: t || {},
				logType: e === "compile-error" ? "error" : e === "fallback" || e === "missing" ? "warning" : "default"
			}
		});
	}
}
function editScope(e, t) {
	let n = getComposer$2(e.nodeId, t);
	if (n) {
		let [t] = e.path;
		t === "locale" && isString$1(e.state.value) ? n.locale.value = e.state.value : t === "fallbackLocale" && (isString$1(e.state.value) || isArray$1(e.state.value) || isObject$1(e.state.value)) ? n.fallbackLocale.value = e.state.value : t === "inheritLocale" && isBoolean$1(e.state.value) && (n.inheritLocale = e.state.value);
	}
}
function convertComposerOptions(e) {
	let t = isString$1(e.locale) ? e.locale : DEFAULT_LOCALE, n = isString$1(e.fallbackLocale) || isArray$1(e.fallbackLocale) || isPlainObject(e.fallbackLocale) || e.fallbackLocale === !1 ? e.fallbackLocale : t, r = isFunction$1(e.missing) ? e.missing : void 0, i = isBoolean$1(e.silentTranslationWarn) || isRegExp(e.silentTranslationWarn) ? !e.silentTranslationWarn : !0, a = isBoolean$1(e.silentFallbackWarn) || isRegExp(e.silentFallbackWarn) ? !e.silentFallbackWarn : !0, o = isBoolean$1(e.fallbackRoot) ? e.fallbackRoot : !0, s = !!e.formatFallbackMessages, c = isPlainObject(e.modifiers) ? e.modifiers : {}, l = e.pluralizationRules, u = isFunction$1(e.postTranslation) ? e.postTranslation : void 0, d = isString$1(e.warnHtmlInMessage) ? e.warnHtmlInMessage !== "off" : !0, f = !!e.escapeParameterHtml, p = isBoolean$1(e.sync) ? e.sync : !0, m = e.messages;
	if (isPlainObject(e.sharedMessages)) {
		let t = e.sharedMessages;
		m = Object.keys(t).reduce((e, n) => (assign(e[n] || (e[n] = {}), t[n]), e), m || {});
	}
	let { __i18n: g, __root: _, __injectWithOption: v } = e, y = e.datetimeFormats, b = e.numberFormats, x = e.flatJson;
	return {
		locale: t,
		fallbackLocale: n,
		messages: m,
		flatJson: x,
		datetimeFormats: y,
		numberFormats: b,
		missing: r,
		missingWarn: i,
		fallbackWarn: a,
		fallbackRoot: o,
		fallbackFormat: s,
		modifiers: c,
		pluralRules: l,
		postTranslation: u,
		warnHtmlMessage: d,
		escapeParameter: f,
		messageResolver: e.messageResolver,
		inheritLocale: p,
		__i18n: g,
		__root: _,
		__injectWithOption: v
	};
}
function createVueI18n(e = {}) {
	let t = createComposer(convertComposerOptions(e)), { __extender: n } = e, r = {
		id: t.id,
		get locale() {
			return t.locale.value;
		},
		set locale(e) {
			t.locale.value = e;
		},
		get fallbackLocale() {
			return t.fallbackLocale.value;
		},
		set fallbackLocale(e) {
			t.fallbackLocale.value = e;
		},
		get messages() {
			return t.messages.value;
		},
		get datetimeFormats() {
			return t.datetimeFormats.value;
		},
		get numberFormats() {
			return t.numberFormats.value;
		},
		get availableLocales() {
			return t.availableLocales;
		},
		get missing() {
			return t.getMissingHandler();
		},
		set missing(e) {
			t.setMissingHandler(e);
		},
		get silentTranslationWarn() {
			return isBoolean$1(t.missingWarn) ? !t.missingWarn : t.missingWarn;
		},
		set silentTranslationWarn(e) {
			t.missingWarn = isBoolean$1(e) ? !e : e;
		},
		get silentFallbackWarn() {
			return isBoolean$1(t.fallbackWarn) ? !t.fallbackWarn : t.fallbackWarn;
		},
		set silentFallbackWarn(e) {
			t.fallbackWarn = isBoolean$1(e) ? !e : e;
		},
		get modifiers() {
			return t.modifiers;
		},
		get formatFallbackMessages() {
			return t.fallbackFormat;
		},
		set formatFallbackMessages(e) {
			t.fallbackFormat = e;
		},
		get postTranslation() {
			return t.getPostTranslationHandler();
		},
		set postTranslation(e) {
			t.setPostTranslationHandler(e);
		},
		get sync() {
			return t.inheritLocale;
		},
		set sync(e) {
			t.inheritLocale = e;
		},
		get warnHtmlInMessage() {
			return t.warnHtmlMessage ? "warn" : "off";
		},
		set warnHtmlInMessage(e) {
			t.warnHtmlMessage = e !== "off";
		},
		get escapeParameterHtml() {
			return t.escapeParameter;
		},
		set escapeParameterHtml(e) {
			t.escapeParameter = e;
		},
		get pluralizationRules() {
			return t.pluralRules || {};
		},
		__composer: t,
		t(...e) {
			return Reflect.apply(t.t, t, [...e]);
		},
		rt(...e) {
			return Reflect.apply(t.rt, t, [...e]);
		},
		te(e, n) {
			return t.te(e, n);
		},
		tm(e) {
			return t.tm(e);
		},
		getLocaleMessage(e) {
			return t.getLocaleMessage(e);
		},
		setLocaleMessage(e, n) {
			t.setLocaleMessage(e, n);
		},
		mergeLocaleMessage(e, n) {
			t.mergeLocaleMessage(e, n);
		},
		d(...e) {
			return Reflect.apply(t.d, t, [...e]);
		},
		getDateTimeFormat(e) {
			return t.getDateTimeFormat(e);
		},
		setDateTimeFormat(e, n) {
			t.setDateTimeFormat(e, n);
		},
		mergeDateTimeFormat(e, n) {
			t.mergeDateTimeFormat(e, n);
		},
		n(...e) {
			return Reflect.apply(t.n, t, [...e]);
		},
		getNumberFormat(e) {
			return t.getNumberFormat(e);
		},
		setNumberFormat(e, n) {
			t.setNumberFormat(e, n);
		},
		mergeNumberFormat(e, n) {
			t.mergeNumberFormat(e, n);
		}
	};
	return r.__extender = n, process.env.NODE_ENV !== "production" && (r.__enableEmitter = (e) => {
		let n = t;
		n[EnableEmitter] && n[EnableEmitter](e);
	}, r.__disableEmitter = () => {
		let e = t;
		e[DisableEmitter] && e[DisableEmitter]();
	}), r;
}
function defineMixin(e, t, n) {
	return {
		beforeCreate() {
			let r = getCurrentInstance();
			/* istanbul ignore if */
			if (!r) throw createI18nError(I18nErrorCodes.UNEXPECTED_ERROR);
			let i = this.$options;
			if (i.i18n) {
				let r = i.i18n;
				if (i.__i18n && (r.__i18n = i.__i18n), r.__root = t, this === this.$root) this.$i18n = mergeToGlobal(e, r);
				else {
					r.__injectWithOption = !0, r.__extender = n.__vueI18nExtend, this.$i18n = createVueI18n(r);
					let e = this.$i18n;
					e.__extender && (e.__disposer = e.__extender(this.$i18n));
				}
			} else if (i.__i18n) if (this === this.$root) this.$i18n = mergeToGlobal(e, i);
			else {
				this.$i18n = createVueI18n({
					__i18n: i.__i18n,
					__injectWithOption: !0,
					__extender: n.__vueI18nExtend,
					__root: t
				});
				let e = this.$i18n;
				e.__extender && (e.__disposer = e.__extender(this.$i18n));
			}
			else this.$i18n = e;
			i.__i18nGlobal && adjustI18nResources(t, i, i), this.$t = (...e) => this.$i18n.t(...e), this.$rt = (...e) => this.$i18n.rt(...e), this.$te = (e, t) => this.$i18n.te(e, t), this.$d = (...e) => this.$i18n.d(...e), this.$n = (...e) => this.$i18n.n(...e), this.$tm = (e) => this.$i18n.tm(e), n.__setInstance(r, this.$i18n);
		},
		mounted() {
			/* istanbul ignore if */
			if (process.env.NODE_ENV !== "production" && this.$el && this.$i18n) {
				let e = this.$i18n;
				this.$el.__VUE_I18N__ = e.__composer;
				let t = this.__v_emitter = createEmitter();
				e.__enableEmitter && e.__enableEmitter(t), t.on("*", addTimelineEvent);
			}
		},
		unmounted() {
			let e = getCurrentInstance();
			/* istanbul ignore if */
			if (!e) throw createI18nError(I18nErrorCodes.UNEXPECTED_ERROR);
			let t = this.$i18n;
			process.env.NODE_ENV !== "production" && this.$el && this.$el.__VUE_I18N__ && (this.__v_emitter && (this.__v_emitter.off("*", addTimelineEvent), delete this.__v_emitter), this.$i18n && (t.__disableEmitter && t.__disableEmitter(), delete this.$el.__VUE_I18N__)), delete this.$t, delete this.$rt, delete this.$te, delete this.$d, delete this.$n, delete this.$tm, t.__disposer && (t.__disposer(), delete t.__disposer, delete t.__extender), n.__deleteInstance(e), delete this.$i18n;
		}
	};
}
function mergeToGlobal(e, t) {
	e.locale = t.locale || e.locale, e.fallbackLocale = t.fallbackLocale || e.fallbackLocale, e.missing = t.missing || e.missing, e.silentTranslationWarn = t.silentTranslationWarn || e.silentFallbackWarn, e.silentFallbackWarn = t.silentFallbackWarn || e.silentFallbackWarn, e.formatFallbackMessages = t.formatFallbackMessages || e.formatFallbackMessages, e.postTranslation = t.postTranslation || e.postTranslation, e.warnHtmlInMessage = t.warnHtmlInMessage || e.warnHtmlInMessage, e.escapeParameterHtml = t.escapeParameterHtml || e.escapeParameterHtml, e.sync = t.sync || e.sync, e.__composer[SetPluralRulesSymbol](t.pluralizationRules || e.pluralizationRules);
	let n = getLocaleMessages(e.locale, {
		messages: t.messages,
		__i18n: t.__i18n
	});
	return Object.keys(n).forEach((t) => e.mergeLocaleMessage(t, n[t])), t.datetimeFormats && Object.keys(t.datetimeFormats).forEach((n) => e.mergeDateTimeFormat(n, t.datetimeFormats[n])), t.numberFormats && Object.keys(t.numberFormats).forEach((n) => e.mergeNumberFormat(n, t.numberFormats[n])), e;
}
var baseFormatProps = {
	tag: { type: [String, Object] },
	locale: { type: String },
	scope: {
		type: String,
		validator: (e) => e === "parent" || e === "global",
		default: "parent"
	},
	i18n: { type: Object }
};
function getInterpolateArg({ slots: e }, n) {
	return n.length === 1 && n[0] === "default" ? (e.default ? e.default() : []).reduce((e, n) => [...e, ...n.type === Fragment ? n.children : [n]], []) : n.reduce((t, n) => {
		let r = e[n];
		return r && (t[n] = r()), t;
	}, create());
}
function getFragmentableTag() {
	return Fragment;
}
var Translation = /* @__PURE__ */ defineComponent({
	name: "i18n-t",
	props: assign({
		keypath: {
			type: String,
			required: !0
		},
		plural: {
			type: [Number, String],
			validator: (e) => isNumber$1(e) || !isNaN(e)
		}
	}, baseFormatProps),
	setup(e, t) {
		let { slots: n, attrs: r } = t, i = e.i18n || useI18n({
			useScope: e.scope,
			__useComponent: !0
		});
		return () => {
			let a = Object.keys(n).filter((e) => e[0] !== "_"), o = create();
			e.locale && (o.locale = e.locale), e.plural !== void 0 && (o.plural = isString$1(e.plural) ? +e.plural : e.plural);
			let s = getInterpolateArg(t, a), l = i[TranslateVNodeSymbol](e.keypath, s, o), u = assign(create(), r);
			return h(isString$1(e.tag) || isObject$1(e.tag) ? e.tag : getFragmentableTag(), u, l);
		};
	}
});
function isVNode$1(e) {
	return isArray$1(e) && !isString$1(e[0]);
}
function renderFormatter(e, t, n, r) {
	let { slots: i, attrs: a } = t;
	return () => {
		let t = { part: !0 }, o = create();
		e.locale && (t.locale = e.locale), isString$1(e.format) ? t.key = e.format : isObject$1(e.format) && (isString$1(e.format.key) && (t.key = e.format.key), o = Object.keys(e.format).reduce((t, r) => n.includes(r) ? assign(create(), t, { [r]: e.format[r] }) : t, create()));
		let s = r(e.value, t, o), l = [t.key];
		isArray$1(s) ? l = s.map((e, t) => {
			let n = i[e.type], r = n ? n({
				[e.type]: e.value,
				index: t,
				parts: s
			}) : [e.value];
			return isVNode$1(r) && (r[0].key = `${e.type}-${t}`), r;
		}) : isString$1(s) && (l = [s]);
		let u = assign(create(), a);
		return h(isString$1(e.tag) || isObject$1(e.tag) ? e.tag : getFragmentableTag(), u, l);
	};
}
var NumberFormat = /* @__PURE__ */ defineComponent({
	name: "i18n-n",
	props: assign({
		value: {
			type: Number,
			required: !0
		},
		format: { type: [String, Object] }
	}, baseFormatProps),
	setup(e, t) {
		let n = e.i18n || useI18n({
			useScope: e.scope,
			__useComponent: !0
		});
		return renderFormatter(e, t, NUMBER_FORMAT_OPTIONS_KEYS, (...e) => n[NumberPartsSymbol](...e));
	}
});
function getComposer$1(e, t) {
	let n = e;
	if (e.mode === "composition") return n.__getInstance(t) || e.global;
	{
		let r = n.__getInstance(t);
		return r == null ? e.global.__composer : r.__composer;
	}
}
function vTDirective(e) {
	let t = (t) => {
		process.env.NODE_ENV !== "production" && warnOnce(getWarnMessage(I18nWarnCodes.DEPRECATE_TRANSLATE_CUSTOME_DIRECTIVE));
		let { instance: n, value: r } = t;
		/* istanbul ignore if */
		if (!n || !n.$) throw createI18nError(I18nErrorCodes.UNEXPECTED_ERROR);
		let i = getComposer$1(e, n.$), a = parseValue(r);
		return [Reflect.apply(i.t, i, [...makeParams(a)]), i];
	};
	return {
		created: (n, r) => {
			let [i, a] = t(r);
			inBrowser && e.global === a && (n.__i18nWatcher = watch(a.locale, () => {
				r.instance && r.instance.$forceUpdate();
			})), n.__composer = a, n.textContent = i;
		},
		unmounted: (e) => {
			inBrowser && e.__i18nWatcher && (e.__i18nWatcher(), e.__i18nWatcher = void 0, delete e.__i18nWatcher), e.__composer && (e.__composer = void 0, delete e.__composer);
		},
		beforeUpdate: (e, { value: t }) => {
			if (e.__composer) {
				let n = e.__composer, r = parseValue(t);
				e.textContent = Reflect.apply(n.t, n, [...makeParams(r)]);
			}
		},
		getSSRProps: (e) => {
			let [n] = t(e);
			return { textContent: n };
		}
	};
}
function parseValue(e) {
	if (isString$1(e)) return { path: e };
	if (isPlainObject(e)) {
		if (!("path" in e)) throw createI18nError(I18nErrorCodes.REQUIRED_VALUE, "path");
		return e;
	} else throw createI18nError(I18nErrorCodes.INVALID_VALUE);
}
function makeParams(e) {
	let { path: t, locale: n, args: r, choice: i, plural: a } = e, o = {}, s = r || {};
	return isString$1(n) && (o.locale = n), isNumber$1(i) && (o.plural = i), isNumber$1(a) && (o.plural = a), [
		t,
		s,
		o
	];
}
function apply(e, t, ...n) {
	let r = isPlainObject(n[0]) ? n[0] : {};
	(!isBoolean$1(r.globalInstall) || r.globalInstall) && ([Translation.name, "I18nT"].forEach((t) => e.component(t, Translation)), [NumberFormat.name, "I18nN"].forEach((t) => e.component(t, NumberFormat)), [DatetimeFormat.name, "I18nD"].forEach((t) => e.component(t, DatetimeFormat))), e.directive("t", vTDirective(t));
}
var I18nInjectionKey = /* @__PURE__ */ makeSymbol("global-vue-i18n");
function createI18n(e = {}) {
	let t = __VUE_I18N_LEGACY_API__ && isBoolean$1(e.legacy) ? e.legacy : __VUE_I18N_LEGACY_API__;
	process.env.NODE_ENV !== "production" && t && warnOnce(getWarnMessage(I18nWarnCodes.DEPRECATE_LEGACY_MODE));
	let n = isBoolean$1(e.globalInjection) ? e.globalInjection : !0, r = /* @__PURE__ */ new Map(), [i, a] = createGlobal(e, t), o = /* @__PURE__ */ makeSymbol(process.env.NODE_ENV === "production" ? "" : "vue-i18n");
	function s(e) {
		return r.get(e) || null;
	}
	function c(e, t) {
		r.set(e, t);
	}
	function l(e) {
		r.delete(e);
	}
	let u = {
		get mode() {
			return __VUE_I18N_LEGACY_API__ && t ? "legacy" : "composition";
		},
		async install(e, ...r) {
			if (process.env.NODE_ENV !== "production" && (e.__VUE_I18N__ = u), e.__VUE_I18N_SYMBOL__ = o, e.provide(e.__VUE_I18N_SYMBOL__, u), isPlainObject(r[0])) {
				let e = r[0];
				u.__composerExtend = e.__composerExtend, u.__vueI18nExtend = e.__vueI18nExtend;
			}
			let i = null;
			!t && n && (i = injectGlobalFields(e, u.global)), __VUE_I18N_FULL_INSTALL__ && apply(e, u, ...r), __VUE_I18N_LEGACY_API__ && t && e.mixin(defineMixin(a, a.__composer, u));
			let s = e.unmount;
			if (e.unmount = () => {
				i && i(), u.dispose(), s();
			}, process.env.NODE_ENV !== "production") {
				if (!await enableDevTools(e, u)) throw createI18nError(I18nErrorCodes.CANNOT_SETUP_VUE_DEVTOOLS_PLUGIN);
				let n = createEmitter();
				if (t) {
					let e = a;
					e.__enableEmitter && e.__enableEmitter(n);
				} else {
					let e = a;
					e[EnableEmitter] && e[EnableEmitter](n);
				}
				n.on("*", addTimelineEvent);
			}
		},
		get global() {
			return a;
		},
		dispose() {
			i.stop();
		},
		__instances: r,
		__getInstance: s,
		__setInstance: c,
		__deleteInstance: l
	};
	return u;
}
function useI18n(e = {}) {
	let t = getCurrentInstance();
	if (t == null) throw createI18nError(I18nErrorCodes.MUST_BE_CALL_SETUP_TOP);
	if (!t.isCE && t.appContext.app != null && !t.appContext.app.__VUE_I18N_SYMBOL__) throw createI18nError(I18nErrorCodes.NOT_INSTALLED);
	let n = getI18nInstance(t), r = getGlobalComposer(n), i = getComponentOptions(t), a = getScope(e, i);
	if (a === "global") return adjustI18nResources(r, e, i), r;
	if (a === "parent") {
		let i = getComposer(n, t, e.__useComponent);
		return i ??= (process.env.NODE_ENV !== "production" && warn(getWarnMessage(I18nWarnCodes.NOT_FOUND_PARENT_SCOPE)), r), i;
	}
	let o = n, c = o.__getInstance(t);
	if (c == null) {
		let n = assign({}, e);
		"__i18n" in i && (n.__i18n = i.__i18n), r && (n.__root = r), c = createComposer(n), o.__composerExtend && (c[DisposeSymbol] = o.__composerExtend(c)), setupLifeCycle(o, t, c), o.__setInstance(t, c);
	} else process.env.NODE_ENV !== "production" && a === "local" && warn(getWarnMessage(I18nWarnCodes.DUPLICATE_USE_I18N_CALLING));
	return c;
}
function createGlobal(e, t) {
	let n = effectScope(), r = __VUE_I18N_LEGACY_API__ && t ? n.run(() => createVueI18n(e)) : n.run(() => createComposer(e));
	if (r == null) throw createI18nError(I18nErrorCodes.UNEXPECTED_ERROR);
	return [n, r];
}
function getI18nInstance(e) {
	let t = inject(e.isCE ? I18nInjectionKey : e.appContext.app.__VUE_I18N_SYMBOL__);
	/* istanbul ignore if */
	if (!t) throw createI18nError(e.isCE ? I18nErrorCodes.NOT_INSTALLED_WITH_PROVIDE : I18nErrorCodes.UNEXPECTED_ERROR);
	return t;
}
function getScope(e, t) {
	return isEmptyObject(e) ? "__i18n" in t ? "local" : "global" : e.useScope ? e.useScope : "local";
}
function getGlobalComposer(e) {
	return e.mode === "composition" ? e.global : e.global.__composer;
}
function getComposer(e, t, n = !1) {
	let r = null, i = t.root, a = getParentComponentInstance(t, n);
	for (; a != null;) {
		let t = e;
		if (e.mode === "composition") r = t.__getInstance(a);
		else if (__VUE_I18N_LEGACY_API__) {
			let e = t.__getInstance(a);
			e != null && (r = e.__composer, n && r && !r[InejctWithOptionSymbol] && (r = null));
		}
		if (r != null || i === a) break;
		a = a.parent;
	}
	return r;
}
function getParentComponentInstance(e, t = !1) {
	return e == null ? null : t && e.vnode.ctx || e.parent;
}
function setupLifeCycle(e, t, n) {
	let r = null;
	onMounted(() => {
		if (process.env.NODE_ENV !== "production" && t.vnode.el) {
			t.vnode.el.__VUE_I18N__ = n, r = createEmitter();
			let e = n;
			e[EnableEmitter] && e[EnableEmitter](r), r.on("*", addTimelineEvent);
		}
	}, t), onUnmounted(() => {
		let i = n;
		process.env.NODE_ENV !== "production" && t.vnode.el && t.vnode.el.__VUE_I18N__ && (r && r.off("*", addTimelineEvent), i[DisableEmitter] && i[DisableEmitter](), delete t.vnode.el.__VUE_I18N__), e.__deleteInstance(t);
		let a = i[DisposeSymbol];
		a && (a(), delete i[DisposeSymbol]);
	}, t);
}
var globalExportProps = [
	"locale",
	"fallbackLocale",
	"availableLocales"
], globalExportMethods = [
	"t",
	"rt",
	"d",
	"n",
	"tm",
	"te"
];
function injectGlobalFields(e, t) {
	let n = Object.create(null);
	return globalExportProps.forEach((e) => {
		let r = Object.getOwnPropertyDescriptor(t, e);
		if (!r) throw createI18nError(I18nErrorCodes.UNEXPECTED_ERROR);
		let i = isRef(r.value) ? {
			get() {
				return r.value.value;
			},
			set(e) {
				r.value.value = e;
			}
		} : { get() {
			return r.get && r.get();
		} };
		Object.defineProperty(n, e, i);
	}), e.config.globalProperties.$i18n = n, globalExportMethods.forEach((n) => {
		let r = Object.getOwnPropertyDescriptor(t, n);
		if (!r || !r.value) throw createI18nError(I18nErrorCodes.UNEXPECTED_ERROR);
		Object.defineProperty(e.config.globalProperties, `$${n}`, r);
	}), () => {
		delete e.config.globalProperties.$i18n, globalExportMethods.forEach((t) => {
			delete e.config.globalProperties[`$${t}`];
		});
	};
}
var DatetimeFormat = /* @__PURE__ */ defineComponent({
	name: "i18n-d",
	props: assign({
		value: {
			type: [Number, Date],
			required: !0
		},
		format: { type: [String, Object] }
	}, baseFormatProps),
	setup(e, t) {
		let n = e.i18n || useI18n({
			useScope: e.scope,
			__useComponent: !0
		});
		return renderFormatter(e, t, DATETIME_FORMAT_OPTIONS_KEYS, (...e) => n[DatetimePartsSymbol](...e));
	}
});
if (initFeatureFlags(), registerMessageCompiler(compile), registerMessageResolver(resolveValue), registerLocaleFallbacker(fallbackWithLocaleChain), process.env.NODE_ENV !== "production" || __INTLIFY_PROD_DEVTOOLS__) {
	let e = getGlobalThis();
	e.__INTLIFY__ = !0, setDevToolsHook(e.__INTLIFY_DEVTOOLS_GLOBAL_HOOK__);
}
process.env.NODE_ENV;
var i18n_default = createI18n({
	legacy: !1,
	locale: "zh_CN",
	fallbackLocale: "zh_CN",
	messages: {
		zh_CN: {
			common: {
				yes: "是",
				no: "否",
				actions: "操作",
				add: "添加",
				delete: "删除",
				edit: "编辑",
				save: "保存",
				confirm: "确定",
				cancel: "取消",
				close: "关闭",
				clear: "清除",
				more: "更多",
				"action-prompt": "操作提示",
				"close-confirm": "确定关闭吗？",
				"delete-confirm": "确定删除吗？",
				"cancel-confirm": "确定取消吗？",
				"edit-confirm": "确定编辑吗？",
				"save-confirm": "确定保存吗？",
				"save-success": "保存成功",
				"save-error": "保存失败",
				"delete-success": "删除成功",
				"delete-error": "删除失败",
				success: "成功",
				error: "错误",
				fail: "失败",
				loading: "加载中",
				"loading-finished": "数据加载完毕",
				data: "数据",
				"no-data": "暂无数据",
				content: "内容",
				"no-content": "暂无内容",
				search: "搜索",
				start: "开始",
				end: "结束"
			},
			form: {
				"please-select": "请选择{title}",
				"please-input": "请填写{title}",
				"please-upload": "请上传{title}",
				"search-placeholder": "请输入搜索内容",
				upload: "上传",
				"upload-fail": "上传失败，请稍后再试",
				"upload-size-limit": "超过服务器上传附件的大小限制",
				"upload-size-max": "上传文件大小不能超过{size}MB",
				"upload-num-max": "最多只能上传{num}个文件",
				options: "选项",
				title: "标题",
				"row-title": "行标题",
				scale: "分值",
				attachment: "附件"
			},
			search: {
				equal: "等于",
				"not-equal": "不等于",
				include: "包含",
				exclude: "不包含",
				"include-sub": "包括子级",
				"less-than": "小于",
				"greater-than": "大于",
				between: "介于",
				null: "为空",
				"not-null": "不为空",
				"multiple-choice-available": "可多选",
				"start-time": "开始时间",
				"end-time": "结束时间",
				"last-week": "上周",
				"last-month": "上个月",
				"past-week": "过去一周",
				"past-two-weeks": "过去两周",
				"past-month": "过去一个月",
				"past-days": "过去{days}天",
				"textarea-placeholder": "搜索{title}，每行一个",
				"sort-setting": "排序设置",
				"toggle-more": "展示/关闭更多搜索选项",
				collapse: "收起",
				"clear-all-search-items": "清除所有搜索项",
				"search-items": "搜索条件",
				"item-unit": "项",
				"items-unit": "项",
				"sortable-items": "可排序项",
				"sorted-items": "已排序项",
				"select-sorting-item": "请选择排序项",
				ascending: "升序排序",
				descending: "降序排序",
				"remove-item": "移除当前项"
			},
			table: {
				editable: "可编辑",
				total: "共 {total} 条",
				custom: "自定义列",
				"select-all": "全选",
				"unselect-all": "取消全选",
				attachment: "查看附件 {title}",
				"copy-success": "复制成功"
			},
			"signature-pad": { agreement: "请先同意协议" }
		},
		en_US: {
			common: {
				yes: "Yes",
				no: "No",
				actions: "Actions",
				add: "Add",
				delete: "Delete",
				edit: "Edit",
				save: "Save",
				confirm: "Confirm",
				cancel: "Cancel",
				close: "Close",
				clear: "Clear",
				more: "More",
				"action-prompt": "Tips",
				"close-confirm": "Are you sure you want to close?",
				"delete-confirm": "Are you sure you want to delete this item?",
				"cancel-confirm": "Are you sure you want to cancel this action?",
				"edit-confirm": "Are you sure you want to edit this item?",
				"save-confirm": "Are you sure you want to save this item?",
				"save-success": "Save success",
				"save-error": "Save error",
				"delete-success": "Delete success",
				"delete-error": "Delete error",
				success: "Success",
				error: "Error",
				fail: "Fail",
				loading: "Loading",
				"loading-finished": "Finished",
				data: "Data",
				"no-data": "No data",
				content: "Content",
				"no-content": "No content",
				search: "Search",
				start: "Start",
				end: "End"
			},
			form: {
				"please-select": "Please select {title}",
				"please-input": "Please input {title}",
				"please-upload": "Please upload {title}",
				"search-placeholder": "Please enter search content",
				upload: "Upload",
				"upload-fail": "Upload fail",
				"upload-size-limit": "Exceeded the server upload attachment size limit",
				"upload-size-max": "The maximum file size you can upload is {size}MB",
				"upload-num-max": "You can only upload up to {num} files",
				options: "Options",
				title: "Title",
				"row-title": "Row title",
				scale: "Scale",
				attachment: "Attachment"
			},
			search: {
				equal: "Equal to",
				"not-equal": "Not equal to",
				include: "Include",
				exclude: "Exclude",
				"include-sub": "Include sub-level",
				"less-than": "Less than",
				"greater-than": "Greater than",
				between: "Between",
				null: "Null",
				"not-null": "Not null",
				"multiple-choice-available": "Multiple choice available",
				"start-time": "Start time",
				"end-time": "End time",
				"last-week": "Last week",
				"last-month": "Last month",
				"past-week": "Past week",
				"past-two-weeks": "Past two weeks",
				"past-month": "Past month",
				"past-days": "Past {days} days",
				"textarea-placeholder": "Search {title}，one per line",
				"sort-setting": "Sort setting",
				"toggle-more": "Show/Hide More Search Options",
				collapse: "Collapse",
				"clear-all-search-items": "Clear all search items",
				"search-items": "Search",
				"item-unit": "item",
				"items-unit": "items",
				"sortable-items": "Sortable items",
				"sorted-items": "Sorted items",
				"select-sorting-item": "Please select sorting items",
				ascending: "Ascending",
				descending: "Descending",
				"remove-item": "Remove sorting item"
			},
			table: {
				editable: "Editable",
				total: "Total {total}",
				custom: "Custom",
				"select-all": "Select all",
				"unselect-all": "Unselect all",
				attachment: "Attachment {title}",
				"copy-success": "Copy success"
			},
			"signature-pad": { agreement: "Please check the agreement" }
		}
	}
});
function useModalConfirm(e, t, n, r) {
	let i = Modal.confirm({
		title: i18n_default.global.t("common.action-prompt"),
		content: e || "",
		onOk: () => (t && isFunction(t) && t(), n ? (i.update({ okButtonProps: { loading: !0 } }), new Promise(() => {})) : null),
		onCancel: () => {
			r && isFunction(r) && r();
		}
	});
	return i;
}
function useLabelFromOptionsValue(e, t) {
	if (!t) return "";
	let n = t.find((t) => t.value === e);
	return n ? n.label : "";
}
function useFindLabelsInValues(e, t, n) {
	n ||= {
		value: "value",
		label: "label",
		children: "children"
	};
	let r = [];
	function i(e) {
		t.includes(e[n.value]) && r.push(e[n.label]), e[n.children]?.length && e[n.children].forEach((e) => {
			i(e);
		});
	}
	return e.forEach((e) => {
		i(e);
	}), r;
}
function useFindOptionByValue(e, t, n) {
	n ||= {
		value: "value",
		label: "label",
		children: "children"
	};
	for (let r of e) {
		if (r[n.value] === t) return r;
		if (r[n.children] && r[n.children].length) {
			let e = useFindOptionByValue(r[n.children], t, n);
			if (e) return e;
		}
	}
	return null;
}
function useFindLabelsFromPath(e, t, n) {
	n ||= {
		value: "value",
		label: "label",
		children: "children"
	};
	let r = [];
	return reduce(t, (e, t) => {
		let i = find(e, { [n.value]: t });
		if (i) return r.push(i[n.label]), i[n.children];
	}, e), r;
}
function useFindParentLabels(e, t, n) {
	n ||= {
		value: "value",
		label: "label",
		children: "children"
	};
	let r = [];
	function i(e, t, r) {
		for (let a of e) if (a[n.value] === t) {
			r.unshift(a[n.label]);
			break;
		} else if (a[n.children] && i(a[n.children], t, r).length > 0) {
			r.unshift(a[n.label]);
			break;
		}
		return r;
	}
	return i(e, t, r);
}
function useFindParentValues(e, t, n) {
	n ||= {
		value: "value",
		label: "label",
		children: "children"
	};
	let r = [];
	function i(e, t, r) {
		for (let a of e) if (a[n.value] === t) {
			r.unshift(a[n.value]);
			break;
		} else if (a[n.children] && i(a[n.children], t, r).length > 0) {
			r.unshift(a[n.value]);
			break;
		}
		return r;
	}
	return i(e, t, r);
}
function useFindPropertyRecursive(e, t, n) {
	return flatMapDeep(e, (e, r) => r === t ? e : r === n ? useFindPropertyRecursive(e, t, n) : []);
}
var localCacheSession = {}, localSession = {
	setItem(e, t) {
		localCacheSession[e] = t;
	},
	getItem(e) {
		return localCacheSession[e];
	},
	removeItem(e) {
		delete localCacheSession[e];
	}
};
window._printCache = () => {
	console.log(JSON.parse(JSON.stringify(localCacheSession, null, 2)));
};
function useCache(e, t) {
	let n = t || localSession, r = !!t;
	return {
		get(t) {
			let i = n.getItem(e);
			return isNull(i) || isUndefined(i) ? t : r ? JSON.parse(i) : i;
		},
		set(t) {
			n.setItem(e, r ? JSON.stringify(t) : t);
		},
		remove() {
			n.removeItem(e);
		}
	};
}
function useNumber(e, t = 2) {
	if (typeof e != "number" && isNaN(e)) return 0;
	let n = 10 ** t;
	return Math.round(e * n) / n;
}
function useRegexRule(e, t) {
	t ||= {};
	let n = {};
	switch (e) {
		case "email":
			n.pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, n.message = t.message || "请填写正确的邮箱地址";
			break;
		case "phone":
			t.mode === "strict" ? n.pattern = /^(?:(?:\+|00)86)?1(?:(?:3[\d])|(?:4[5-7|9])|(?:5[0-3|5-9])|(?:6[5-7])|(?:7[0-8])|(?:8[\d])|(?:9[1|8|9]))\d{8}$/ : n.pattern = /^(?:(?:\+|00)86)?1[3-9]\d{9}$/, n.message = t.message || "请填写正确的手机号码";
			break;
		case "tel":
		case "telephone":
			t.strict === "strict" ? n.pattern = /^\d{3}-\d{8}$|^\d{4}-\d{7,8}$/ : n.pattern = /^(?:\d{3}-)?\d{8}$|^(?:\d{4}-)?\d{7,8}$/, n.message = t.message || "请填写正确的座机号码";
			break;
		case "ID":
		case "id":
			!t.mode || ["china", "cn"].includes(t.mode?.toLowerCase()) ? t.version?.toLowerCase() === "v1" ? n.pattern = /^[1-9]\d{7}(?:0\d|10|11|12)(?:0[1-9]|[1-2][\d]|30|31)\d{3}$/ : t.version?.toLowerCase() === "v2" ? n.pattern = /^[1-9]\d{5}(?:18|19|20)\d{2}(?:0[1-9]|10|11|12)(?:0[1-9]|[1-2]\d|30|31)\d{3}[\dXx]$/ : n.pattern = /(^\d{8}(0\d|10|11|12)([0-2]\d|30|31)\d{3}$)|(^\d{6}(18|19|20)\d{2}(0[1-9]|10|11|12)([0-2]\d|30|31)\d{3}(\d|X|x)$)/ : [
				"hk",
				"hongkong",
				"xg",
				"xianggang"
			].includes(t.mode.toLowerCase()) || [
				"macau",
				"macao",
				"mo",
				"aomen",
				"am"
			].includes(t.mode.toLowerCase()) ? n.pattern = /^[a-zA-Z]\d{6}\([\dA]\)$/ : ["taiwan", "tw"].includes(t.mode.toLowerCase()) && (n.pattern = /^[a-zA-Z][0-9]{9}$/), n.message = t.message || "请填写正确的证件号码";
			break;
		case "passport":
			n.pattern = /(^[EeKkGgDdSsPpHh]\d{8}$)|(^(([Ee][a-fA-F])|([DdSsPp][Ee])|([Kk][Jj])|([Mm][Aa])|(1[45]))\d{7}$)/, n.message = t.message || "请填写正确的护照号码";
			break;
		case "credit-code":
		case "uscc":
			n.pattern = /^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/, n.message = t.message || "请填写正确的统一社会信用代码";
			break;
		case "bank-account":
		case "bank":
			n.pattern = /^[1-9]\d{9,29}$/, n.message = t.message || "请填写正确的银行账号";
			break;
		case "stock":
			n.pattern = /^(s[hz]|S[HZ])(000[\d]{3}|002[\d]{3}|300[\d]{3}|600[\d]{3}|60[\d]{4})$/, n.message = t.message || "请填写正确的股票代码";
			break;
		case "url":
			t.mode === "image" ? n.pattern = /^https?:\/\/(.+\/)+.+(\.(gif|png|jpg|jpeg|webp|svg|psd|bmp|tif))$/i : t.mode === "video" ? n.pattern = /^https?:\/\/(.+\/)+.+(\.(swf|avi|flv|mpg|rm|mov|wav|asf|3gp|mkv|rmvb|mp4))$/i : n.pattern = /^(((ht|f)tps?):\/\/)?[\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/, n.message = t.message || "请填写正确的链接";
			break;
		case "md5":
			n.pattern = /^([a-f\d]{32}|[A-F\d]{32})$/, n.message = t.message || "请填写正确的md5值";
			break;
		case "base64":
			n.pattern = /^\s*data:(?:[a-z]+\/[a-z0-9-+.]+(?:;[a-z-]+=[a-z0-9-]+)?)?(?:;base64)?,([a-z0-9!$&',()*+;=\-._~:@/?%\s]*?)\s*$/i, n.message = t.message || "请填写正确的base64值";
			break;
		case "currency":
		case "money":
			t.mode === "positive" ? n.pattern = /^\d+(,\d{3})*(\.\d{1,2})?$/ : n.pattern = /^-?\d+(,\d{3})*(\.\d{1,2})?$/, n.message = t.message || "请填写正确的货币金额";
			break;
		case "chinese":
			n.pattern = /^(?:[\u3400-\u4DB5\u4E00-\u9FEA\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0])+$/, n.message = t.message || "请填写中文字符";
			break;
		case "name":
			t.en || t.english ? n.pattern = /(^[a-zA-Z]{1}[a-zA-Z\s]{0,20}[a-zA-Z]{1}$)/ : n.pattern = /^(?:[\u4e00-\u9fa5·]{2,16})$/, n.message = t.message || "请填写正确的姓名";
			break;
		case "decimal":
			n.pattern = /^\d+\.\d+$/, n.message = t.message || "请填写正确的小数";
			break;
		case "number":
			n.pattern = /^\d{1,}$/, n.message = t.message || "请填写正确的数字";
			break;
		case "date":
			n.pattern = /^\d{4}(-)(1[0-2]|0?\d)\1([0-2]\d|\d|30|31)$/, n.message = t.message || "请填写正确的日期";
			break;
		case "time":
			t.mode === "12" ? n.pattern = /^(?:1[0-2]|0?[1-9]):[0-5]\d:[0-5]\d$/ : n.pattern = /^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/, n.message = t.message || "请填写正确的时间";
			break;
		case "car":
		case "plate-number":
		case "car-number":
			t.mode === "green" || t.mode === "newEnergy" ? n.pattern = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领]{1}[A-HJ-NP-Z]{1}(([0-9]{5}[DF])|([DF][A-HJ-NP-Z0-9][0-9]{4}))$/ : t.mode === "notNewEnergy" ? n.pattern = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领]{1}[A-HJ-NP-Z]{1}[A-HJ-NP-Z0-9]{4}[A-HJ-NP-Z0-9挂学警港澳]{1}$/ : n.pattern = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领]{1}[A-HJ-NP-Z]{1}(?:(([0-9]{5}[DF])|([DF][A-HJ-NP-Z0-9][0-9]{4}))|[A-HJ-NP-Z0-9]{4}[A-HJ-NP-Z0-9挂学警港澳]{1})$/, n.message = t.message || "请填写正确的车牌号";
			break;
		case "version":
			n.pattern = /^\d+(?:\.\d+){2}$/, n.message = t.message || "请填写正确的版本号";
			break;
		case "ip":
		case "IP":
			t.mode === "v6" || t.mode === "ipv6" ? n.pattern = /^(?:(?:(?:[0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){5}:([0-9A-Fa-f]{1,4}:)?[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){4}:([0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){3}:([0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){2}:([0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(([0-9A-Fa-f]{1,4}:){0,5}:((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(::([0-9A-Fa-f]{1,4}:){0,5}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|([0-9A-Fa-f]{1,4}::([0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})|(::([0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,7}:))|\[(?:(?:(?:[0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){5}:([0-9A-Fa-f]{1,4}:)?[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){4}:([0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){3}:([0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){2}:([0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(([0-9A-Fa-f]{1,4}:){0,5}:((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(::([0-9A-Fa-f]{1,4}:){0,5}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|([0-9A-Fa-f]{1,4}::([0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})|(::([0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,7}:))\](?::(?:[0-9]|[1-9][0-9]{1,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5]))?$/i : n.pattern = /^((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]).){3}(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])(?::(?:[0-9]|[1-9][0-9]{1,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5]))?$/, n.message = t.message || "请填写正确的IP地址";
			break;
		case "qq":
			n.pattern = /^[1-9][0-9]{4,10}$/, n.message = t.message || "请填写正确的QQ号";
			break;
		case "wechat":
			n.pattern = /^[a-zA-Z][-_a-zA-Z0-9]{5,19}$/, n.message = t.message || "请填写正确的微信号";
			break;
		case "alpha-numeric":
		case "numeric-alpha":
			n.mode === "strict" ? n.pattern = /^(?=.*[a-zA-Z])(?=.*\d).+$/ : n.pattern = /^[A-Za-z0-9]+$/, n.message = t.message || "请填写字母与数字的组合";
			break;
		case "alpha":
			t.mode === "lower" || t.mode === "lowercase" ? n.pattern = /^[a-z]+$/ : t.mode === "upper" || t.mode === "uppercase" ? n.pattern = /^[A-Z]+$/ : n.pattern = /^[a-zA-Z]+$/, n.message = t.message || "请填写正确的字母";
			break;
		case "username":
			n.pattern = /^[a-zA-Z0-9_-]{4,16}$/, n.message = t.message || "请填写正确的用户名";
			break;
		case "password":
			n.pattern = /^\S*(?=\S{6,})(?=\S*\d)(?=\S*[A-Z])(?=\S*[a-z])(?=\S*[!@#$%^&*? ])\S*$/, n.message = t.message || "密码必须包含大小写字母、数字和特殊字符，不少于6位";
			break;
		case "zip":
			n.pattern = /^(0[1-7]|1[0-356]|2[0-7]|3[0-6]|4[0-7]|5[1-7]|6[1-7]|7[0-5]|8[013-6])\d{4}$/, n.message = t.message || "请填写正确的邮政编码";
			break;
		case "mac":
		case "MAC":
			n.pattern = /^((([a-f0-9]{2}:){5})|(([a-f0-9]{2}-){5}))[a-f0-9]{2}$/i, n.message = t.message || "请填写正确的MAC地址";
			break;
	}
	return n;
}
function useT(e, t) {
	let { t: n } = useI18n();
	return isArray(e) ? e.map((e) => n(e, t)).join("") : n(e, t);
}
function useI18nJoin(e, t, n) {
	let { capitalizeFirst: r = !0, uncapitalizeSecond: i = !0, uncapitalizeSecondAll: a = !0 } = n || {};
	n ||= {};
	let { locale: o } = n;
	return o ||= useI18n().locale, o.value.includes("en") ? (e = e.trim(), t = t.trim(), r && (e = e.charAt(0).toUpperCase() + e.slice(1)), i && (t = t.charAt(0).toLowerCase() + t.slice(1)), a && (t = t.toLowerCase()), `${e} ${t}`) : `${e}${t}`;
}
export { useSm3 as A, _configStatus as C, useDateUnix as D, useDateFormat as E, useSm4Encrypt as M, useDayjs as O, STATUS as S, usePage as T, useFormFail as _, useFindLabelsFromPath as a, useProcessStatus as b, useFindParentLabels as c, useLabelFromOptionsValue as d, useNumber as f, formLabel as g, useI18n as h, useCache as i, useSm4Decrypt as j, useSm2 as k, useFindParentValues as l, i18n_default as m, useT as n, useFindLabelsInValues as o, useModalConfirm as p, useRegexRule as r, useFindOptionByValue as s, useI18nJoin as t, useFindPropertyRecursive as u, useFormFormat as v, useFetch as w, useProcessStatusSuccess as x, useHiddenForm as y };

//# sourceMappingURL=hooks-_1eGrPxv.js.map