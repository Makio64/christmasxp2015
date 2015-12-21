float applyColorBurnToChannel(float base, float blend) {
	return ((blend == 0.0) ? blend : max((1.0 - ((1.0 - base) / blend)), 0.0));
}

vec3 colorBurn(vec3 base, vec3 blend) {
    vec3 o = vec3(1.0);
    o.r = applyColorBurnToChannel(base.r, blend.r);
    o.g = applyColorBurnToChannel(base.g, blend.g);
    o.b = applyColorBurnToChannel(base.b, blend.b);
//    applyColorBurnToChannel(base.a, blend.a)
    return o;
}