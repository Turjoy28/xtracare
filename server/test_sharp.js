const sharp = require('sharp');
async function test() {
  try {
    const buffer = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'); // 1x1 gif
    const transformer = sharp(buffer);
    transformer.resize(undefined, undefined);
    const out = await transformer.toFormat("gif").toBuffer();
    console.log("Success with undefined resize", out.length);
  } catch(e) {
    console.error("Error with undefined resize:", e);
  }
}
test();
