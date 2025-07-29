declare module "jszip" {
  class JSZip {
    file(name: string, data: string | Blob): this;
    generateAsync(options: { type: string }): Promise<Blob>;
  }

  export default JSZip;
}
