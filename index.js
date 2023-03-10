const cheerio = require('cheerio');
const axios = require('axios'); 
const express = require('express');
const cors = require('cors');
const { utils } = require('ethers');
const app = express();
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Credentials", true);
    next();
});
app.use(express.json());
app.use(cors({
    origin: "*",
}));
// 0x7c87561b129f46998fc9Afb53F98b7fdaB68696f test


/*
    not verify that not have abi and bytecode
    0x7Ef17Da8398C57724b866a75d4c3D02425037d37
*/

const sleep = (time) => new Promise((resolve)=> {
    setTimeout(() => {
        resolve(); 
    }, time);
});

const scrapeContract = async (address) =>{
    const etherContractUrl = `https://goerli.etherscan.io/address/${address}#code`
    const mainTage = 'main#content';
    const bytecodeTage = 'div div#verifiedbytecode2';
    const abiTage = 'div#dividcode div pre#js-copytextarea2';
    const contractElement = {
        bytecode: '',
        abi: ''
    };

    try{
        let data = "";
        while (data.includes('moment') || data.length == 0) {
            await sleep(2000);
            let result = await axios.request({
                method: "GET",
                url: etherContractUrl, 
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
                }
            });
            if (result && result.status == 200) {
                data = result.data;
            }
        }

        if (
            $(item).find(bytecodeTage).length
            && $(item).find(abiTage).length
        ) {
            contractElement.bytecode = $(item).find(bytecodeTage).text();
            contractElement.abi = JSON.parse($(item).find(abiTage).text());

            let functionElement = [];
            contractElement.abi.filter((abiElement) => 
                abiElement.type === 'function')
                .map((element) => 
                    functionElement.push({
                        function: element.name,
                        parameter: element.inputs,
                        stateMutability: element.stateMutability,
                        outputs: element.outputs[0]?.type
                    }
                )
            );

            return functionElement;
        }

        else {
            return {error : 'error'};
        }
    }
    
    catch (err){
        return err;
    }
}



app.get('/', (req, res) => {
    res.status(200).send('hello')
})

app.post('/', async (req, res) => {
    const address = req.body.address;
    console.log("req", req);

    // check it is address of contract
    console.log(address);
    
    if (utils.isAddress(address)) {
        const data = await scrapeContract(address);
        console.log(data);
        return res.status(200).json(data);
    }

    return res.status(404).json('The address is invalid')

})


app.listen(3000, () => {
    console.log('server is running at http://localhost:3000');
});

module.exports = app;
