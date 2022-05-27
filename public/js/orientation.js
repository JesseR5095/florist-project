const orientation = function getUploadedImageOrientation(file, callback) {
  const reader = new FileReader();

  reader.onload = (e) => {
    const view = new DataView(e.target.result);

    if (view.getUint16(0, false) != 0xFFD8) { // checks image is jpeg
      return callback(-1);
    }

    const length = view.byteLength;

    let offset = 2;

    while (offset < length) {
      if (view.getUint16(offset+2, false) <= 8) { // exits without finding application marker
        return callback(-2);
      }

      const marker = view.getUint16(offset, false);

      offset += 2;

      if (marker == 0xFFE1) { // APP1 marker
        offset += 2;

        if (view.getUint32(offset, false) != 0x45786966) { // exits if no Exif header
          return callback(-3);
        }

        offset += 6;

        const little = view.getUint16(offset, false) == 0x4949; // determine endianness

        offset += view.getUint32(offset + 4, little);

        const tags = view.getUint16(offset, little);

        offset += 2;

        for (let i = 0; i < tags; i++) {
          if (view.getUint16(offset + (i * 12), little) == 0x0112) { // orientation tag
            return callback(view.getUint16(offset + (i * 12) + 8, little));
          }
        }
      } else if ((marker & 0xFF00) != 0xFF00) {
        break;
      } else {
        offset += view.getUint16(offset, false);
      }
    }

    return callback(-2);
  };

  reader.readAsArrayBuffer(file);
};

export default orientation;
