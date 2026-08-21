const CELL_SIZE = 3;
const OFFSET_SIZE = 10;

const pointOffset = [{
    x: 0,
    y: 0
}, {
    x: 1,
    y: 0
}, {
    x: 2,
    y: 0
}, {
    x: 0,
    y: 1
}, {
    x: 1,
    y: 1
}, {
    x: 2,
    y: 1
}, {
    x: 0,
    y: 2
}, {
    x: 1,
    y: 2
}, {
    x: 2,
    y: 2
}];

const createBinaryText = text => {
    return text.split('').map(function (char) {
        const value = char.charCodeAt(0).toString(2);
        return {
            value,
            padded: value.padStart(8, '0')
        };
    });
}
const createTextFromBinary = values => {
    return values.map(value => {
        return String.fromCharCode(parseInt(value, 2));
    }).join('');
}
const createTable = ({ bytePattern, dimensions }) => {
    const table = [];

    for (let y = 0; y < dimensions; y++) {
        const blocks = [];
        const h = y * CELL_SIZE;
        for (let x = 0; x < dimensions; x++) {
            const w = x * CELL_SIZE;
            const block = bytePattern.map(id => {
                const index = (+id) - 1;
                const { x: ox, y: oy } = pointOffset[index];
                return {
                    x: w + ox + OFFSET_SIZE,
                    y: h + oy + OFFSET_SIZE
                }
            });
            blocks.push(block);
        }
        table.push(blocks);
    }
    return table;
}
class BitMapperService {

    constructor() {

    }

    textToImage({
        text,
        maxWidth,
        bytePattern,
        orderPattern,
    }) {
        // console.log(text)
        const bin = createBinaryText(text);
        const paddedValues = bin.map(({ value, padded }) => {
            return padded;
        });
        const average = Math.ceil(Math.sqrt(paddedValues.length, 2));
        const dimensions = average + average % 3;
        const dimensionWidth = dimensions * CELL_SIZE;
        const width = dimensionWidth + OFFSET_SIZE * 2;

        const table = createTable({ bytePattern, dimensions });
        const ordered = [];
        for (let i = 0; i < paddedValues.length; i += 4) {
            const startIndex = i;
            const endIndex = i + 4;
            const batch = paddedValues.slice(startIndex, endIndex);
            const renderItems = orderPattern.reduce((acc, itemIndex) => {
                acc.push(batch[(+itemIndex) - 1]);
                return acc;
            }, []);
            ordered.push(renderItems);
        }
        const { translated } = ordered.reduce((acc, data) => {
            let { table, current, translated, row } = acc;
            data.forEach(value => {
                if (value) {
                    if (!row.length) {
                        acc.row = row = [...table[current++]];
                    }
                    const block = row.shift();
                    const bits = value.split('');
                    const pattern = block.map((point, index) => {
                        const bit = bits[index];
                        const color = bit === '1' ? '0' : '255';
                        point.bit = bit;
                        point.color = color;
                        return {
                            point,
                            bit,
                            color
                        }
                    });

                    translated.push({
                        block,
                        value,
                        bits,
                        pattern
                    });
                }
            })
            acc.current = current;
            return acc;
        }, {
            row: [],
            table,
            current: 0,
            translated: []
        });

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = width;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = 'white';
        // ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.fillRect(0, 0, width, width);
        const imageData = ctx.getImageData(0, 0, width, width);
        const data = imageData.data;

        translated.forEach(({ block }) => {
            block.forEach(({ x, y, color }) => {
                const pos = y * (width * 4) + x * 4;
                data[pos] = color;
                data[pos + 1] = color;
                data[pos + 2] = color;
            });
        });
        ctx.putImageData(imageData, 0, 0);
        // const restoredValues = this.canvasToText({
        //     bytePattern,
        //     orderPattern,
        //     canvas,
        //     translated,
        //     paddedValues
        // });
        // const restored = createTextFromBinary(restoredValues);
        // console.log({
        //     ok: text.localeCompare(restored),
        //     paddedValues,
        //     restoredValues,
        //     restored,
        //     text
        // })
        canvas.toBlob(
            blob => {
                const anchor = document.createElement('a');
                anchor.download = 'my-file-name.jpg'; // optional, but you can give the file a name
                anchor.href = URL.createObjectURL(blob);
                anchor.click();
                URL.revokeObjectURL(anchor.href); // remove it from memory and save on memory! 😎
            },
            'image/jpeg',
            0.9,
        );
        return canvas.toDataURL('image/png');
    }
    imageToText({
        img,
        bytePattern,
        orderPattern,
    }) {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        return this.canvasToText({
            bytePattern,
            orderPattern,
            canvas,
        });
    }
    canvasToText({
        bytePattern,
        orderPattern,
        canvas,
    }) {
        const ctx = canvas.getContext("2d");
        const maxWidth = canvas.width;
        const imageData = ctx.getImageData(0, 0, maxWidth, maxWidth);
        const data = imageData.data;

        const dimensionWidth = maxWidth - OFFSET_SIZE * 2;
        const dimensions = dimensionWidth / CELL_SIZE;
        const table = createTable({ bytePattern, dimensions });
        const pixels = table.reduce((acc, blocks) => {
            blocks.forEach(block => {
                const points = block.map(point => {
                    const { x, y } = point;
                    const pos = y * (maxWidth * 4) + x * 4;
                    const color = data[pos];
                    const bit = color > 100 ? '0' : '1';
                    return {
                        x,
                        y,
                        color,
                        bit
                    };
                });
                if (!points.every(({ bit }) => bit === '0')) {
                    acc.push(points);
                }
            });
            return acc;
        }, []);
        const result = pixels.map(d => d.map(({ bit }) => bit).join(''));
        // const source = translated.map(({ value }) => value);
        // const errors = source.some((v, i) => v !== result[i]);

        const addBatch = ({ values, batch }) => {
            batch.sort((a, b) => a.index - b.index);
            values.push(...batch.map(({ value }) => value));
            batch.length = 0;
        }
        const reverted = result.reduce((acc, value, index) => {
            const { batch } = acc;
            if (batch.length === 4) {
                addBatch(acc);
            }
            batch.push({
                index: (+orderPattern[index % 4]),
                value
            });

            return acc;
        }, {
            values: [],
            batch: []
        });
        addBatch(reverted);
        const { values } = reverted;
        const restored = createTextFromBinary(values);
        return restored;
    }
}

export default BitMapperService