import React, { useEffect, useCallback, useState, useRef } from "react";
const LZUTF8 = require('lzutf8');
import CryptoJS from 'crypto-js';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import * as XLSX from 'xlsx/xlsx.mjs';

// var workbook = XLSX.utils.table_to_book(table_elt);

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Stack from '@mui/material/Stack';
import DeleteIcon from '@mui/icons-material/Delete';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';


import { Column, Table } from 'react-virtualized';
import BitMapperService from './bit.mapper.service';


class CryptoService {
    constructor() {

    }
    encrypt(input, secret) {
        const cipherText = CryptoJS.AES.encrypt(input, secret);
        return cipherText.toString();
    }
    decrypt(input, secret) {
        try {
            const bytes = CryptoJS.AES.decrypt(input, secret);
            return bytes.toString(CryptoJS.enc.Utf8)
        }
        catch (err) {
            console.log('UNABLE TO DECIPHER', err)
        }
    }
    test() {
        const emsg = this.encrypt("heloo ", "keep me safe secret");
        const dmsg = this.decrypt(emsg, "keep me safe secret");
        console.log({
            emsg,
            dmsg
        });
    }
}

class ZipService {
    constructor() {

    }
    async compress(input) {
        return new Promise((resolve) => {
            LZUTF8.compressAsync(input, { outputEncoding: "StorageBinaryString" }, function (result, error) {
                if (!error) {
                    console.log("Data successfully compressed and encoded to " + result.length + " characters");
                    resolve(result);
                }
                else {
                    console.log("Compression error: " + error.message);
                    resolve(null, error);
                }
            });
        })
    }
    async decompress(input) {
        return new Promise((resolve) => {
            LZUTF8.decompressAsync(input, { inputEncoding: "StorageBinaryString", outputEncoding: "String" }, function (result, error) {
                if (!error) {
                    console.log("Data successfully decompressed to " + result.length + " characters");
                    resolve(result);
                }
                else {
                    console.log("Compression error: " + error.message);
                    resolve(null, error);
                }
            });
        });

    }
    async test() {
        const zipped = await this.compress('12335345345lkgd;gkdf12335345345lkgd;gkdf12335345345lkgd;gkdf12335345345lkgd;gkdf12335345345lkgd;gkdf12335345345lkgd;gkdf12335345345lkgd;gkdf12335345345lkgd;gkdf');
        const unzipped = await this.decompress(zipped);
        console.log({
            zipped,
            unzipped
        });
    }
}

const zipService = new ZipService();
const cryptoService = new CryptoService();
const bitMapperService = new BitMapperService();
// cryptoService.test();
// zipService.test();

const getRowCols = (cols, current = []) => {
    const tmp = [...Array(cols).keys()].reduce((acc) => {
        const cell = [...Array(cols).keys()];
        acc.rows.push(cell.map(n => {
            const id = acc.id++;
            acc.ids[id] = 1;
            return id;
        }));
        return acc;
    }, {
        id: 1,
        rows: [],
        ids: {}
    });
    if (current.length) {
        current.forEach(id => {
            tmp.ids[id] = 0;
        });
    }
    return tmp;
}
const PatterPreviewItem = props => {
    const { id: currentId, rows } = props;
    const style = {
        flexDirection: 'column'
    };
    return <div style={style}>
        <table>
            {
                rows.map((row, i) => {
                    const cols = row.map(id => {
                        const props = {
                            id,
                            selected: currentId !== id,
                            addPattern: () => { }
                        };
                        if (props.selected) props.id = ' ';
                        return i ? <td><PatternCell {...props} /></td> : <th><PatternCell {...props} /></th>
                    });
                    return <tr>
                        {
                            cols.map(d => d)
                        }
                    </tr>
                })
            }
        </table>
    </div>
}
const PatterPreview = props => {
    const { cols, pattern } = props;
    const { rows } = getRowCols(cols);
    const style = {
        display: 'flex',
        flexDirection: 'row'
    };
    return <div style={style}>
        {
            pattern.map(id => {
                return <PatterPreviewItem id={id} rows={rows} />
            })
        }
    </div>
}
const PatternCell = props => {
    const { id, selected, addPattern } = props;
    const style = {
        width: 32,
        height: 32,
        margin: '0 5px 5px 0',
        fontSize: '24px',
        lineHeight: '32px',
        textAlign: 'center',
        cursor: 'pointer',
        backgroundColor: 'gray',
        border: '1px solid #f9f9f9',
        borderRadius: '5px',

        ...(!selected ? {
            backgroundColor: "red"
        } : {})
    };
    const onClick = () => {
        if (!selected) return;
        addPattern(id);
    }
    return <div style={style} onClick={onClick}>
        <b>{id}</b>
    </div>
}
const PatternComponent = props => {
    const {
        table: cols,
        patternName,
        onUpdatePattern,
        current: pattern
    } = props;
    const { rows, ids: avaliable } = getRowCols(cols, pattern);
    const addPattern = (id) => {
        if (pattern.length === 8) return;
        avaliable[id] = 0;
        pattern.push(id);
        onUpdatePattern(patternName, pattern);
    };
    return <div>
        <table>
            <tbody>
                {
                    rows.map((row, i) => {
                        const cols = row.map(id => {
                            const key = `cell-${id}`;
                            const props = {
                                id,
                                selected: avaliable[id],
                                addPattern
                            };
                            return i ? <td key={key}><PatternCell {...props} /></td> : <th key={key}><PatternCell {...props} /></th>
                        });
                        return <tr key={`row-${i}`}>
                            {
                                cols.map(d => d)
                            }
                        </tr>
                    })
                }
            </tbody>
        </table>
    </div>
}
const CustomTextField = props => {
    const { text, name, onChange, valid = '123456789' } = props;
    const handleChange = (event) => {
        const value = event.target.value;
        const vals = value.split('');
        if (vals.length) {
            const $valid = valid.split('');
            if (vals.some(v => !$valid.includes(v))) {
                setValue(value);
                return;
            }
            const stats = vals.reduce((acc, v) => {
                acc[v] = (acc[v] || 0) + 1;
                return acc;
            }, {});
            if (Object.entries(stats).some(([k, v]) => v > 1)) {
                setValue(value);
                return;
            }
        }
        onChange(name, value);
    };
    return <FormControl variant="standard">
        <TextField
            size="small" inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
            label={name}
            value={text}
            onChange={handleChange}
        />
    </FormControl>;

}
const PasswordField = props => {
    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    return <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
        <FormControl sx={{ width: '25ch' }} variant="outlined">
            <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
            <OutlinedInput
                id="outlined-adornment-password"
                type={showPassword ? 'text' : 'password'}
                size="small"
                endAdornment={
                    <InputAdornment position="end">
                        <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                        >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    </InputAdornment>
                }
                label="Password"
            />
        </FormControl>
    </Box>;
}
const PatternSettings = props => {
    const {
        state = {},
        updatePattern
    } = props;

    useEffect(() => {

    }, [state]);
    const onChange = (patternName) => (name, value) => {
        updatePattern(patternName, value.split(''))
    }
    const {
        bytePattern = [],
        orderPattern = []
    } = state;
    return <div>
        <Box
            component="form"
            sx={{
                '& > :not(style)': { m: 1, width: '40ch' },
            }}
            noValidate
            autoComplete="off"
        >
            <Stack direction="row" spacing={1}>
                <PasswordField />
                <IconButton color="secondary">
                    <DeleteIcon />
                </IconButton>
            </Stack>

            <Stack direction="row" spacing={1}>
                <CustomTextField text={bytePattern.join('')} name='Byte' onChange={onChange('bytePattern')} />
                <CustomTextField text={orderPattern.join('')} name='Order' onChange={onChange('orderPattern')} valid='1234' />
                <CopyToClipboard text={`${bytePattern.join('')}-${orderPattern.join('')}`}
                    onCopy={() => { }}>
                    <IconButton color="secondary">
                        <ContentCopyIcon />
                    </IconButton>
                </CopyToClipboard>
            </Stack>
        </Box>
    </div>
}

const SettingsTab = props => {
    const {
        appState,
        resetPattern,
        updatePattern,
    } = props;
    const {
        bytePattern,
        orderPattern
    } = appState;
    const style = {
        display: 'flex',
        flexDirection: 'row'
    };

    return <div>
        <PatternSettings resetPattern={resetPattern} state={appState} updatePattern={updatePattern} />
        <div style={style}>
            <PatternComponent table={3} current={bytePattern} patternName='bytePattern' onUpdatePattern={updatePattern} />
            <PatternComponent table={2} current={orderPattern} patternName='orderPattern' onUpdatePattern={updatePattern} />
        </div>
    </div>
        ;
}
function TabPanel(props) {
    const { children, value, tabName, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== tabName}
            id={`simple-tabpanel-${tabName}`}
            aria-labelledby={`simple-tab-${tabName}`}
            {...other}
        >
            {value === tabName && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const TableView = props => {
    const { rows } = props;
    useEffect(() => {

    }, [rows])
    const [sample = {}] = rows;
    const cells = Object.keys(sample);
    // https://www.copycat.dev/blog/material-ui-table/
    const style = {
        height: 800,
        width: 1000,
        headerHeight: 20,
        rowHeight: 30
    };
    // https://codesandbox.io/s/j30k46l7xw?file=/src/Demo.js:1105-1820
    const headerRenderer = ({
        columnData,
        dataKey,
        disableSort,
        label,
        sortBy,
        sortDirection
    }) => {
        return (
            <React.Fragment key={dataKey}>
                <div className="ReactVirtualized__Table__headerTruncatedText">
                    {label}
                </div>
            </React.Fragment>
        );
    };
    return rows.length ? (
        <Table
            {...style}
            rowCount={rows.length}
            rowGetter={({ index }) => rows[index]}
        >
            {
                cells.map((cellName, i) => {
                    return <Column key={`cell-${cellName}`} dataKey={cellName} label={cellName} headerRenderer={headerRenderer} width={100} />
                })
            }
        </Table>
    ) : <div />;
}
const FileComponent = props => {
    const inputRef = useRef(null);

    const { onChange, label, accept = "image/*" } = props;
    const key = `load-${label}`;
    const style = {
        margin: '10px',
        padding: '20px'
    };
    return <div>
        <label htmlFor={key} style={style}>
            <input
                ref={inputRef}
                style={{ display: 'none' }}
                id={key}
                name={key}
                type="file"
                accept={accept}
                onChange={onChange}
            />

            <Button color="secondary" variant="contained" onClick={() => inputRef.current.click()}  >
                {label}
            </Button>
        </label>
    </div>
}
const ExcelComponent = props => {
    const { onLoad, appState, onSave, onImageLoad } = props;
    const {
        rows = []
    } = appState;
    const loadXlsx = data => {
        const workbook = XLSX.read(data, { type: 'binary' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const arr = XLSX.utils.sheet_to_json(worksheet);
        onLoad(arr);
    }
    const onFileLoad = (callBack, type) => (event) => {
        const { nativeEvent } = event;
        const { target } = nativeEvent;
        const files = target.files;
        const [f] = files;
        const reader = new FileReader();
        // https://docs.sheetjs.com/docs/api/utilities/
        reader.onload = (evt) => {
            const data = evt.target.result;
            callBack(data, type);
        };
        if (type === 'readAsDataURL') {
            reader.readAsDataURL(f);
        }
        else {
            reader.readAsArrayBuffer(f);
        }
    }
    const onReset = () => {
        onLoad([]);
    }
    useEffect(() => { }, [rows]);
    const style = {
        display: 'flex',
        flexDirection: 'row'
    };
    return <div >
        <div style={style}>
            <FileComponent
                label="Upload"
                accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={onFileLoad(loadXlsx)}
            />
            <Button color="secondary" onClick={onReset} >
                Reset
            </Button>
            <Button color="secondary" onClick={onSave} >
                Save
            </Button>
            <FileComponent
                label="Load"
                accept="image/*"
                onChange={onFileLoad(onImageLoad, 'readAsDataURL')}
            />
        </div>
        <TableView rows={rows} />
    </div>;
}
const jsonArrayToCsv = json => {
    const result = json.reduce((acc, obj, i) => {
        let { rows, cols } = acc;
        if (!i) {
            acc.cols = cols = Object.keys(obj);
        }
        const record = cols.map((colName, i) => obj[colName] || '');
        rows.push(record);
        return acc;
    }, {
        cols: [],
        rows: []
    });
    return result;
}
const csvToJsonArray = ({ rows, cols }) => {
    const result = rows.map(row => {
        const record = cols.reduce((ac, colName, i) => {
            ac[colName] = row[i] || '';
            return ac;
        }, {});
        return record;
    });
    return result;
}
const HelpComponent = props => {
    return <Card sx={{ minWidth: 275, maxWidth: 400 }}>
        <CardContent>
            <Typography variant="h5" component="div">
                Setting:
            </Typography>
            <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom style={{ wordWrap: "break-word" }}>
                Password - specify password for AES encryption
            </Typography>
            <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom style={{ wordWrap: "break-word" }}>
                Byte[pattern] - each byte pixel , 9 pixels [3x3] , is writen by byte pattern[1..9]
            </Typography>
            <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom style={{ wordWrap: "break-word" }}>
                Order[pattern] - each 4 byte blocks, [2x2] off 9 pixels[3x3], is writen/ordered by Order Pattern.[1..4]
            </Typography>
            <Typography variant="h5" component="div">
                Excel:
            </Typography>
            <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom style={{ wordWrap: "break-word" }}>
                Upload - load xlsx file to table
            </Typography>
            <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom style={{ wordWrap: "break-word" }}>
                Reset - remove table
            </Typography>
            <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom style={{ wordWrap: "break-word" }}>
                Save - save table to image
            </Typography>
            <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom style={{ wordWrap: "break-word" }}>
                Load - load image to table
            </Typography>
        </CardContent>
    </Card>
}
const App = () => {
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };
    const MAX_WIDTH = 1000;
    const [appState, setAppState] = useState({
        bytePattern: ['1', '3', '4', '2', '5', '6', '7', '8'],
        orderPattern: ['1', '3', '2', '4'],
        with: MAX_WIDTH,
        password: '',
        rows: []
    });
    const resetPattern = useCallback(() => {
        setAppState({
            ...appState,
            bytePattern: [],
            orderPattern: [],
        });
    }, [appState]);
    const updatePattern = useCallback((patternName, pattern) => {
        setAppState({
            ...appState,
            [patternName]: pattern
        });
    }, [appState]);

    const saveToImage = async ({ state }) => {
        const {
            password,
            bytePattern,
            orderPattern,
            rows,
        } = state;
        const csv = jsonArrayToCsv(rows);
        const array = csvToJsonArray(csv);
        const jsonData = JSON.stringify(csv);
        const compressed = await zipService.compress(jsonData);
        const emsg = cryptoService.encrypt(compressed, password);
        const mapCanvas = bitMapperService.textToImage({
            text: emsg,
            maxWidth: MAX_WIDTH,
            bytePattern,
            orderPattern,
        });
        // const dmsg = cryptoService.decrypt(emsg, password);
        // const decompressed = await zipService.decompress(dmsg);
        // console.log({
        //     mapCanvas,
        //     emsg: emsg.length,
        //     data: jsonData.length,
        //     compressed: compressed.length,
        //     jsonData,
        //     decompressed,
        //     csv,
        //     array,
        //     rows
        // })
    }
    const onExcelLoaded = (state) => async (rows) => {
        setAppState({
            ...state,
            rows
        });
    }
    const onSave = (state) => async () => {
        await saveToImage({ state });
    }

    const onPasswordChange = useCallback((value) => {
        setAppState({
            ...appState,
            password: value
        });
    }, [appState]);
    const onImageLoad = state => async (data, type) => {
        const {
            password,
            bytePattern,
            orderPattern,
        } = state;
        const img = new Image();
        img.onload = async () => {
            const emsg = bitMapperService.imageToText({
                img,
                bytePattern,
                orderPattern
            });
            const dmsg = cryptoService.decrypt(emsg, password);
            const decompressed = await zipService.decompress(dmsg);
            const csv = JSON.parse(decompressed);
            const array = csvToJsonArray(csv);
            // console.log({ emsg, decompressed, dmsg, array });
            setAppState({
                ...state,
                rows: array
            });
        };
        img.src = data;
    }
    useEffect(() => {

    }, [appState]);
    function a11yProps(index) {
        return {
            id: `simple-tab-${index}`,
            'aria-controls': `simple-tabpanel-${index}`,
        };
    }
    const style = {
        display: 'flex',
        flexDirection: 'row'
    };

    return <div>
        <h1>Keep me safe - keep xlsx file secured in image!</h1>
        <div style={style}>
            <HelpComponent />
            <Box sx={{ width: '100%' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                        <Tab label="Settings" {...a11yProps(0)} />
                        <Tab label="Excel" {...a11yProps(1)} />
                    </Tabs>
                </Box>
                <TabPanel value={value} tabName={0}>
                    <SettingsTab
                        resetPattern={resetPattern}
                        appState={appState}
                        updatePattern={updatePattern}
                        onPasswordChange={onPasswordChange}
                    />
                </TabPanel>
                <TabPanel value={value} tabName={1}>
                    <ExcelComponent
                        appState={appState}
                        onSave={onSave(appState)}
                        onLoad={onExcelLoaded(appState)}
                        onImageLoad={onImageLoad(appState)}
                    />
                </TabPanel>
            </Box>

        </div>
    </div>
        ;
}

export default App