const cheerio = require('cheerio');
const axios = require('axios'); 
const express = require('express');
const cors = require('cors');
const { utils } = require('ethers');
const app = express();
app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173",
}));
// 0x7c87561b129f46998fc9Afb53F98b7fdaB68696f test


/*
    not verify that not have abi and bytecode
    0x7Ef17Da8398C57724b866a75d4c3D02425037d37
*/

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
        const { data } = await axios.get(etherContractUrl);
        const $ = cheerio.load(data);
        const item = $(mainTage);

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

    // check it is address of contract
    console.log(address);
    
    if (utils.isAddress(address)) {
        const data = await scrapeContract(address);
        console.log(data);
        return res.status(200).json(data);
    }

    return res.status(404).json('The address is invalid')

})


app.listen(8080, () => {
    console.log('server is running at http://localhost:8080');
});

module.exports = app;