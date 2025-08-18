// Minimal shim so TypeScript recognizes the bcryptjs module
declare module "bcryptjs" {
  export function compare(data: string, encrypted: string): Promise<boolean>;
  export function hash(data: string, salt: number): Promise<string>;
  const _default: {
    compare: typeof compare;
    hash: typeof hash;
  };
  export default _default;
}


