var defaultPermissions = [], authDirective = { beforeMount(t, n) {
	let { value: r } = n, { arg: i } = n;
	if (!r) return;
	(typeof r == "string" || r instanceof String) && (r = [r]);
	let [a, o] = r;
	o ||= defaultPermissions, (typeof a == "string" || a instanceof String) && (a = [a]), i === void 0 || i === "all" ? a.every((e) => o.includes(e)) || (t.style.display = "none") : i === "any" ? a.some((e) => o.includes(e)) || (t.style.display = "none") : i === "none" && a.some((e) => o.includes(e)) && (t.style.display = "none");
} };
function setDefaultPermissions(t) {
	defaultPermissions = t;
}
function auth(t, n) {
	if (!t) return !0;
	(typeof t == "string" || t instanceof String) && (t = [t]);
	let [r, i] = t;
	if (i ||= defaultPermissions, (typeof r == "string" || r instanceof String) && (r = [r]), n === void 0 || n === "all") {
		if (!r.every((e) => i.includes(e))) return !1;
	} else if (n === "any") {
		if (!r.some((e) => i.includes(e))) return !1;
	} else if (n === "none" && r.some((e) => i.includes(e))) return !1;
	return !0;
}
var auth_default = { install(e, i) {
	e.directive("auth", authDirective), e.config.globalProperties.$auth = auth, e.provide("auth", auth), i && i.defaultPermissions && setDefaultPermissions(i.defaultPermissions);
} };
export { auth_default as auth, setDefaultPermissions };

//# sourceMappingURL=directives.js.map