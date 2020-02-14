export function Mixin(baseCtors: Function[]) {
    return function (derivedCtor: Function): void {
        baseCtors.forEach(baseCtor => {
            Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
                derivedCtor.prototype[name] = baseCtor.prototype[name];
            });
        });
    };
}
