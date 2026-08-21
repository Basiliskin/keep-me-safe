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

const createTable = ({ dimensionWidth }) => {
    const table = [];
    for (let y = 0; y < dimensionWidth; y += CELL_SIZE) {
        const blocks = [];
        for (let x = 0; x < dimensionWidth; x += CELL_SIZE) {
            const block = pointOffset.map(({ x: ox, y: oy }) => {
                return {
                    x: x + ox + OFFSET_SIZE,
                    y: y + oy + OFFSET_SIZE
                }
            });
            blocks.push(block);
        }
        table.push(blocks);
    }
    return table;
}
const textToImage = ({
    text,
    maxWidth,
    bytePattern,
    orderPattern,
}) => {
    const bin = createBinaryText(text);
    const paddedValues = bin.map(({ value, padded }) => {
        return padded;
    });

    try {
        const totalLength = paddedValues.length * CELL_SIZE;
        const rows = Math.ceil(totalLength / maxWidth);
        const cols = Math.ceil(maxWidth / CELL_SIZE);
        const average = Math.ceil((rows + cols) / 2);
        const dimensions = average + average % 3;
        const dimensionWidth = dimensions * CELL_SIZE;
        const width = dimensionWidth + OFFSET_SIZE * 2;
        const table = createTable({ dimensionWidth });
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
        const translated = ordered.reduce((acc, data) => {
            let { table, current, response, row } = acc;
            data.forEach(value => {
                if (value) {
                    if (!row.length) {
                        current++;
                        acc.row = row = [...table[current]];
                    }
                    const block = row.shift();
                    const bits = value.split('');
                    const pattern = bytePattern.map(id => {
                        const index = (+id) - 1;
                        const bit = bits[index];
                        const color = bit === '1' ? '0' : '255';
                        block[index].bit = bit;
                        block[index].color = color;
                        return {
                            point: block[index],
                            bit,
                            color
                        }
                    });

                    response.push({
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
            row: [...table[0]],
            table,
            current: 0,
            response: []
        });

        console.log(translated)
    } catch (e) {
        console.log(e);
    }
    console.log(rectangles);
}

textToImage({
    text: "[{\"name\":\"name\",\"value\":\"value\",\"description\":\"description\"},{\"name\":\"name\",\"value\":\"value\",\"description\":\"description\"},{\"name\":\"name\",\"value\":\"value\",\"description\":\"description\"},{\"name\":\"name\",\"value\":\"value\",\"description\":\"description\"},{\"name\":\"name\",\"value\":\"value\",\"description\":\"description\"},{\"name\":\"name\",\"value\":\"value\",\"description\":\"description\"},{\"name\":\"name\",\"value\":\"value\",\"description\":\"description\"},{\"name\":\"name\",\"value\":\"value\",\"description\":\"description\"},{\"name\":\"name\",\"value\":\"value\",\"description\":\"description\"},{\"name\":\"name\",\"value\":\"value\",\"description\":\"description\"},{\"name\":\"name\",\"value\":\"value\",\"description\":\"description\"},{\"name\":\"name\",\"value\":\"value\",\"description\":\"description\"},{\"name\":\"name\",\"value\":\"value\",\"description\":\"description\"},{\"name\":\"name\",\"value\":\"value\",\"description\":\"description\"},{\"name\":\"name\",\"value\":\"value\",\"description\":\"description\"},{\"name\":\"name\",\"value\":\"value\",\"description\":\"description\"},{\"name\":\"name\",\"value\":\"value\",\"description\":\"description\"},{\"name\":\"name\",\"value\":\"value\",\"description\":\"description\"},{\"name\":\"name\",\"value\":\"value\",\"description\":\"description\"},{\"name\":\"name\",\"value\":\"value\",\"description\":\"description\"},{\"name\":\"name\",\"value\":\"value\",\"description\":\"description\"},{\"name\":\"name\",\"value\":\"value\",\"description\":\"description\"},{\"name\":\"name\",\"value\":\"value\",\"description\":\"description\"},{\"name\":\"name\",\"value\":\"value\",\"description\":\"description\"},{\"name\":\"name\",\"value\":\"value\",\"description\":\"description\"},{\"name\":\"name\",\"value\":\"value\",\"description\":\"description\"},{\"name\":\"name\",\"value\":\"value\",\"description\":\"description\"},{\"name\":\"name\",\"value\":\"value\",\"description\":\"description\"},{\"name\":\"name\",\"value\":\"value\",\"description\":\"description\"},{\"name\":\"name\",\"value\":\"value\",\"description\":\"description\"},{\"name\":\"name\",\"value\":\"value\",\"description\":\"description\"},{\"name\":\"name\",\"value\":\"value\",\"description\":\"description\"},{\"name\":\"name\",\"value\":\"value\",\"description\":\"description\"},{\"name\":\"name\",\"value\":\"value\",\"description\":\"description\"},{\"name\":\"name\",\"value\":\"value\",\"description\":\"description\"},{\"name\":\"name\",\"value\":\"value\",\"description\":\"description\"},{\"name\":\"name\",\"value\":\"value\",\"description\":\"description\"},{\"name\":\"name\",\"value\":\"value\",\"description\":\"description\"},{\"name\":\"name\",\"value\":\"value\",\"description\":\"description\"},{\"name\":\"name\",\"value\":\"value\",\"description\":\"description\"},{\"name\":\"name\",\"value\":\"value\",\"description\":\"description\"},{\"name\":\"name\",\"value\":\"value\",\"description\":\"description\"},{\"name\":\"name\",\"value\":\"value\",\"description\":\"description\"},{\"name\":\"name\",\"value\":\"value\",\"description\":\"description\"}]",
    maxWidth: 100,
    bytePattern: '12345678'.split(''),
    orderPattern: '1234'.split('')
});