var $jC3rJ$nodeassert = require("node:assert");
var $jC3rJ$nodefspromises = require("node:fs/promises");
var $jC3rJ$nodecrypto = require("node:crypto");
var $jC3rJ$nodefs = require("node:fs");
var $jC3rJ$nodehttp = require("node:http");
var $jC3rJ$nodeurl = require("node:url");
var $jC3rJ$nodenet = require("node:net");
var $jC3rJ$assert = require("assert");


function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}
// my original decoder assumed we wouldn't need the original bytes again
// but we do and i'm too lazy to touch the decoder again
// so this hack allows looking up the original bytes
// (could maybe use a WeakRef but really the decoder should just be rewritten)
const $3e273184e3a72f2a$export$226a103a52ef3067 = new Map();


class $82e5f4275773712f$export$50792b0e93539fde {
    constructor(str){
        this.str = str;
    }
    toString() {
        return this.str;
    }
}
class $82e5f4275773712f$export$6ee0ae27af45b853 extends $82e5f4275773712f$export$50792b0e93539fde {
}
class $82e5f4275773712f$export$f25f153afe0ce4cc extends $82e5f4275773712f$export$50792b0e93539fde {
    constructor(strBytes){
        const buffer = Buffer.from(strBytes);
        const str = buffer.toString("utf8");
        (0, $3e273184e3a72f2a$export$226a103a52ef3067).set(str, strBytes);
        super(str);
        this.buffer = buffer;
    }
    toString() {
        return JSON.stringify(this.str);
    }
}
class $82e5f4275773712f$export$5edada7a246e2325 extends $82e5f4275773712f$export$50792b0e93539fde {
    toString() {
        return `[`;
    }
}
class $82e5f4275773712f$export$cde8c14ea0efb6bf extends $82e5f4275773712f$export$50792b0e93539fde {
    toString() {
        return `]`;
    }
}
class $82e5f4275773712f$export$c232086534285ef extends $82e5f4275773712f$export$50792b0e93539fde {
    toString() {
        return `{`;
    }
}
class $82e5f4275773712f$export$c5248a0f555b2c55 extends $82e5f4275773712f$export$50792b0e93539fde {
    toString() {
        return `}`;
    }
}
class $82e5f4275773712f$export$b4cd9db38d761c5c extends $82e5f4275773712f$export$50792b0e93539fde {
    toString() {
        return `, `;
    }
}
class $82e5f4275773712f$export$7be493d1692ce0d3 extends $82e5f4275773712f$export$50792b0e93539fde {
    toString() {
        return `: `;
    }
}


class $66158fbd6a0ff2e9$export$b55edb69cfa7ac57 {
    constructor(tokens = [], openDelims = []){
        this.tokens = tokens;
        this.openDelims = openDelims;
        this.openDelims = openDelims ?? [];
        this.tokens = tokens ?? [];
    }
    end() {
        const top = this.openDelims.at(-1);
        if (top instanceof (0, $82e5f4275773712f$export$5edada7a246e2325)) return this.add(new (0, $82e5f4275773712f$export$cde8c14ea0efb6bf)());
        if (top instanceof (0, $82e5f4275773712f$export$c232086534285ef)) return this.add(new (0, $82e5f4275773712f$export$c5248a0f555b2c55)());
        throw new Error("unexpected end");
    }
    bailStr() {
        if (!this.openDelims.length) return this.toString();
        return this.end().bailStr();
    }
    add(t) {
        let nextDelims = this.openDelims;
        if (t instanceof (0, $82e5f4275773712f$export$5edada7a246e2325)) nextDelims = nextDelims.concat(t);
        else if (t instanceof (0, $82e5f4275773712f$export$c232086534285ef)) nextDelims = nextDelims.concat(t);
        else if (t instanceof (0, $82e5f4275773712f$export$cde8c14ea0efb6bf)) {
            const top = nextDelims.at(-1);
            if (!(top instanceof (0, $82e5f4275773712f$export$5edada7a246e2325))) throw new Error("unmatched close array token");
            nextDelims = [
                ...nextDelims
            ];
            nextDelims.pop();
        } else if (t instanceof (0, $82e5f4275773712f$export$c5248a0f555b2c55)) {
            const top = nextDelims.at(-1);
            if (!(top instanceof (0, $82e5f4275773712f$export$c232086534285ef))) throw new Error("unmatched close dict token");
            nextDelims = [
                ...nextDelims
            ];
            nextDelims.pop();
        }
        const needsArrSep = this.openDelims.at(-1) instanceof (0, $82e5f4275773712f$export$5edada7a246e2325) && !(t instanceof (0, $82e5f4275773712f$export$cde8c14ea0efb6bf)) && !(this.tokens.at(-1) instanceof (0, $82e5f4275773712f$export$5edada7a246e2325));
        const needsKvSep = this.openDelims.at(-1) instanceof (0, $82e5f4275773712f$export$c232086534285ef) && this.tokens.at(-1) instanceof (0, $82e5f4275773712f$export$f25f153afe0ce4cc) && !(this.tokens.at(-2) instanceof (0, $82e5f4275773712f$export$7be493d1692ce0d3));
        const needsDictSep = !needsKvSep && this.openDelims.at(-1) instanceof (0, $82e5f4275773712f$export$c232086534285ef) && !(t instanceof (0, $82e5f4275773712f$export$c5248a0f555b2c55)) && !(this.tokens.at(-1) instanceof (0, $82e5f4275773712f$export$c232086534285ef));
        if (needsArrSep && needsDictSep) throw new Error("cannot need both");
        if (needsKvSep && (needsDictSep || needsArrSep)) throw new Error("cannot need kv and dict/arr sep");
        const nextTokens = needsArrSep || needsDictSep ? this.tokens.concat(new (0, $82e5f4275773712f$export$b4cd9db38d761c5c)()) : needsKvSep ? this.tokens.concat(new (0, $82e5f4275773712f$export$7be493d1692ce0d3)()) : this.tokens;
        return new $66158fbd6a0ff2e9$export$b55edb69cfa7ac57(nextTokens.concat(t), nextDelims);
    }
    toString() {
        const raw = this.tokens.join("");
        const parsed = JSON.parse(raw);
        const str = JSON.stringify(parsed);
        return str;
    }
}



const $8bc3a143ba90e228$export$cea7f32f77c01158 = (ch)=>ch.charCodeAt(0);
const $8bc3a143ba90e228$export$9bb611d729802a56 = $8bc3a143ba90e228$export$cea7f32f77c01158("i");
const $8bc3a143ba90e228$export$a9c23c6ac3fc3eca = $8bc3a143ba90e228$export$cea7f32f77c01158("e");
const $8bc3a143ba90e228$export$96c3628b3b9d2079 = $8bc3a143ba90e228$export$cea7f32f77c01158(":");
const $8bc3a143ba90e228$export$1658304bacb54f82 = $8bc3a143ba90e228$export$cea7f32f77c01158("-");
const $8bc3a143ba90e228$export$561f80bd3c078e48 = $8bc3a143ba90e228$export$cea7f32f77c01158("0");
const $8bc3a143ba90e228$export$91bc1ec88fa68c13 = $8bc3a143ba90e228$export$cea7f32f77c01158("9");
const $8bc3a143ba90e228$export$61196ced6d74a310 = $8bc3a143ba90e228$export$cea7f32f77c01158("l");
const $8bc3a143ba90e228$export$96f57966bedc81b4 = $8bc3a143ba90e228$export$cea7f32f77c01158("d");


const $e4e5653eb30567a4$var$intFromByte = (b)=>Number.parseInt(String.fromCharCode(b), 10);
function $e4e5653eb30567a4$export$da4f2b68efa4c4b(str) {
    const bytes = Buffer.from(str, "utf8");
    const decoded = String($e4e5653eb30567a4$export$a1124e132c740495(bytes));
    return decoded;
}
function $e4e5653eb30567a4$export$a1124e132c740495(bytes, idx = 0, tokens = new (0, $66158fbd6a0ff2e9$export$b55edb69cfa7ac57)()) {
    if (idx > bytes.length) {
        console.error(`>>> ERROR: idx ${idx} > ${bytes.length}`);
        return tokens.bailStr(); // lol - not handling bytes correctly in some sample files?
    }
    if (idx === bytes.length) return tokens;
    if (bytes[idx] === (0, $8bc3a143ba90e228$export$96f57966bedc81b4)) return $e4e5653eb30567a4$export$a1124e132c740495(bytes, idx + 1, tokens.add(new (0, $82e5f4275773712f$export$c232086534285ef)()));
    if (bytes[idx] === (0, $8bc3a143ba90e228$export$61196ced6d74a310)) return $e4e5653eb30567a4$export$a1124e132c740495(bytes, idx + 1, tokens.add(new (0, $82e5f4275773712f$export$5edada7a246e2325)()));
    if (bytes[idx] === (0, $8bc3a143ba90e228$export$a9c23c6ac3fc3eca)) return $e4e5653eb30567a4$export$a1124e132c740495(bytes, idx + 1, tokens.end());
    if (!isNaN($e4e5653eb30567a4$var$intFromByte(bytes[idx]))) {
        let next = idx;
        const sizeBytes = [
            bytes[idx]
        ];
        while(!isNaN($e4e5653eb30567a4$var$intFromByte(bytes[++next])))sizeBytes.push(bytes[next]);
        // // ????
        // if (!bytes[next] === COLON) {
        //   throw new Error('expected :');
        // }
        if (bytes[next] !== (0, $8bc3a143ba90e228$export$96c3628b3b9d2079)) throw new Error("expected :");
        ++next;
        const sizeStr = Buffer.from(sizeBytes).toString("utf8");
        const sizeNum = Number.parseInt(sizeStr, 10);
        const strBytes = [];
        let ate = 0;
        while(ate++ < sizeNum)strBytes.push(bytes[next++]);
        return $e4e5653eb30567a4$export$a1124e132c740495(bytes, next, tokens.add(new (0, $82e5f4275773712f$export$f25f153afe0ce4cc)(strBytes)));
    }
    if (bytes[idx] === (0, $8bc3a143ba90e228$export$9bb611d729802a56)) {
        let next = idx + 1;
        const numBytes = [];
        if (bytes[next] === (0, $8bc3a143ba90e228$export$1658304bacb54f82)) numBytes.push(bytes[next++]);
        while(bytes[next] !== (0, $8bc3a143ba90e228$export$a9c23c6ac3fc3eca) && next < bytes.length){
            const numB = bytes[next++];
            if (numB < (0, $8bc3a143ba90e228$export$561f80bd3c078e48) || numB > (0, $8bc3a143ba90e228$export$91bc1ec88fa68c13)) throw new Error(`invalid integer byte ${numB}`);
            numBytes.push(numB);
        }
        const numStr = Buffer.from(numBytes).toString("utf8");
        ++next;
        return $e4e5653eb30567a4$export$a1124e132c740495(bytes, next, tokens.add(new (0, $82e5f4275773712f$export$6ee0ae27af45b853)(numStr)));
    }
    throw new Error(`Unknown token type at index ${idx}`);
}














function $b18cbde4f374671f$export$a92a1eaeb06ea361(dict) {
    const keys = Object.keys(dict).sort();
    const bytes = [
        (0, $8bc3a143ba90e228$export$cea7f32f77c01158)("d")
    ];
    for (const key of keys){
        const keyStr = `${key.length}:${key}`;
        bytes.push(Array.from(Buffer.from(keyStr, "utf8")));
        const val = dict[key];
        if (typeof val === "number") {
            const intStr = `i${val}e`;
            bytes.push(Array.from(Buffer.from(intStr, "utf8")));
        } else if (typeof val === "string") {
            const strBytes = (0, $3e273184e3a72f2a$export$226a103a52ef3067).get(val);
            if (!strBytes) throw new Error(`no bytes for ${val}`);
            const prefix = `${strBytes.length}:`;
            bytes.push(Array.from(Buffer.from(prefix, "utf8")));
            bytes.push(strBytes);
        } else throw new Error(`unsupported val type for ${val}`);
    }
    bytes.push((0, $8bc3a143ba90e228$export$cea7f32f77c01158)("e"));
    return Buffer.from(bytes.flat());
}


const $0a38c752b5042f46$export$c73dcf559dad2f44 = (file)=>{
    const contents = (0, ($parcel$interopDefault($jC3rJ$nodefs))).readFileSync(file);
    const decoded = (0, $e4e5653eb30567a4$export$a1124e132c740495)(contents);
    const parsed = JSON.parse(decoded);
    const { announce: announce, info: info } = parsed;
    (0, ($parcel$interopDefault($jC3rJ$nodeassert)))(typeof announce === "string", "announce is not a string");
    (0, ($parcel$interopDefault($jC3rJ$nodeassert)))(typeof info === "object", "info is not an object");
    (0, ($parcel$interopDefault($jC3rJ$nodeassert)))(typeof info.length === "number", "info.length is not a number");
    (0, ($parcel$interopDefault($jC3rJ$nodeassert)))(typeof info["piece length"] === "number", 'info["piece length"] is not a number');
    // this should actually be a Buffer or number[] but my original decoder loses some info
    // (i.e. is shit) so we need `hackStrToBytes` to look up the original bytes
    (0, ($parcel$interopDefault($jC3rJ$nodeassert)))(typeof info.pieces === "string", "info.pieces is not a string");
    const encodedInfo = (0, $b18cbde4f374671f$export$a92a1eaeb06ea361)(info);
    const hasher = (0, ($parcel$interopDefault($jC3rJ$nodecrypto))).createHash("sha1");
    hasher.update(encodedInfo);
    const sha1 = hasher.digest("hex");
    const hasherRaw = (0, ($parcel$interopDefault($jC3rJ$nodecrypto))).createHash("sha1");
    hasherRaw.update(encodedInfo);
    const sha1Raw = hasherRaw.digest();
    const piecesConcat = (0, $3e273184e3a72f2a$export$226a103a52ef3067).get(info.pieces);
    const pieceHashes = [];
    for(let i = 0; i < piecesConcat.length; i += 20){
        const p = piecesConcat.slice(i, i + 20);
        pieceHashes.push(Buffer.from(p).toString("hex"));
    }
    const extendedInfo = {
        announce: announce,
        info: info,
        sha1: sha1,
        sha1Raw: sha1Raw,
        pieceHashes: pieceHashes
    };
    return extendedInfo;
};
function $0a38c752b5042f46$export$af06c3af5bd98cb4(file) {
    const { announce: announce, info: info, sha1: sha1, pieceHashes: pieceHashes } = $0a38c752b5042f46$export$c73dcf559dad2f44(file);
    const infoStr = [
        [
            "Tracker URL",
            announce
        ],
        [
            "Length",
            info.length
        ],
        [
            "Info Hash",
            sha1
        ],
        [
            "Piece Length",
            info["piece length"]
        ],
        [
            "Piece Hashes",
            pieceHashes.join("\n"),
            "\n"
        ]
    ].map(([k, v, delim = " "])=>`${k}:${delim}${v}`).join("\n");
    return infoStr;
}









function $943666640c6ab86a$export$ad87d97dc3739470(requestUrl, maxRedirects = 7) {
    return new Promise((resolve, reject)=>{
        (0, ($parcel$interopDefault($jC3rJ$nodehttp))).get(requestUrl, (res)=>{
            const isRedirect = res.statusCode === 301 || res.statusCode === 302;
            if (isRedirect && maxRedirects < 1) return reject(new Error("Too many redirects"));
            else if (isRedirect) {
                const newLocation = res.headers.location;
                const newUrl = newLocation.startsWith("http://") || newLocation.startsWith("https://") ? newLocation : new (0, ($parcel$interopDefault($jC3rJ$nodeurl))).URL(newLocation, requestUrl).href;
                return $943666640c6ab86a$export$ad87d97dc3739470(newUrl, maxRedirects - 1).then(resolve).catch(reject);
            }
            if (res.statusCode < 200 || res.statusCode >= 300) return reject(new Error("StatusCode=" + res.statusCode + ` url=${0, ($parcel$interopDefault($jC3rJ$nodeurl))}`));
            const chunks = [];
            res.on("data", (chunk)=>{
                chunks.push(chunk);
            });
            res.on("end", ()=>{
                const buffer = Buffer.concat(chunks);
                resolve(buffer);
            });
        }).on("error", (err)=>{
            reject(err);
        });
    });
}


const $1f1932f95910f014$var$peerId = "a79a7e603a3d4357b52f";
const $1f1932f95910f014$var$PORT = "6881";
async function $1f1932f95910f014$export$f05eafe0156b3b47(file) {
    const peersResp = await $1f1932f95910f014$export$a8157895bd9c53da(file);
    return peersResp.peers.join("\n");
}
async function $1f1932f95910f014$export$a8157895bd9c53da(file) {
    const info = (0, $0a38c752b5042f46$export$c73dcf559dad2f44)(file);
    const url = $1f1932f95910f014$var$getPeersUrl(info);
    const respStr = await (0, $943666640c6ab86a$export$ad87d97dc3739470)(url);
    const decoded = $1f1932f95910f014$export$6563632edab52a01(respStr);
    return decoded;
}
function $1f1932f95910f014$export$6563632edab52a01(resp) {
    const { interval: interval, peers: peers } = JSON.parse(String((0, $e4e5653eb30567a4$export$a1124e132c740495)(resp)));
    const peersBytes = (0, $3e273184e3a72f2a$export$226a103a52ef3067).get(peers);
    const peerStrs = [];
    for(let i = 0; i < peersBytes.length; i += 6){
        const ip = peersBytes.slice(i, i + 4).join(".");
        // const [p0, p1] = peersBytes.slice(i + 4, i + 6);
        // const port = (p0 << 8) | p1;
        const port = Buffer.from(peersBytes).readUInt16BE(i + 4);
        const str = [
            ip,
            port
        ].join(":");
        peerStrs.push(str);
    }
    return {
        interval: interval,
        peers: peerStrs
    };
}
function $1f1932f95910f014$var$getPeersUrl(info) {
    const infoHashBuf = Buffer.from(info.sha1, "hex");
    if (infoHashBuf.length !== 20) throw new Error("infoHashRaw.length !== 20");
    const params = new URLSearchParams();
    params.append("peer_id", $1f1932f95910f014$var$peerId);
    params.append("port", $1f1932f95910f014$var$PORT);
    params.append("uploaded", "0");
    params.append("downloaded", "0");
    params.append("left", info.info.length.toString());
    params.append("compact", "1");
    let url = `${info.announce}?${params.toString()}`;
    url += `&info_hash=${$1f1932f95910f014$export$3449a3b321ef3023(info.sha1)}`;
    return url;
}
function $1f1932f95910f014$export$3449a3b321ef3023(hexStr) {
    const encoded = [];
    // this is not `encodeURIComponent`
    // the info hash is hex where each pair represents a byte
    // we could escape them all with `%` but the challenge comments say that's not efficient enough
    // so map the pairs that match a safe ascii
    for(let i = 0; i < hexStr.length; i += 2){
        const pair = hexStr.slice(i, i + 2);
        let e = "";
        switch(pair.toLowerCase()){
            case "4c":
                e = "L";
                break;
            case "54":
                e = "T";
                break;
            case "68":
                e = "h";
                break;
            case "71":
                e = "q";
                break;
            default:
                e = `%${pair}`;
        }
        encoded.push(e);
    }
    return encoded.join("");
}






function $38153ead2db24425$export$ba6075743c6fa6a5(data) {
    // should validate the info hash
    const peerId = data.subarray(data.length - 20);
    return {
        peerId: peerId,
        peerIdHex: peerId.toString("hex"),
        handshakeResp: data
    };
}
function $38153ead2db24425$export$74f755347fc62200(info) {
    const prefix = $38153ead2db24425$var$getHandshakePrefix();
    // seems like this should be part of the prefix
    // but the return handshake has a non-zero for one of these
    const reserved = Buffer.from([
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0
    ]);
    (0, ($parcel$interopDefault($jC3rJ$nodeassert)))(reserved.length === 8, "reserved.length !== 8");
    const infoHash = Buffer.from(info.sha1, "hex");
    (0, ($parcel$interopDefault($jC3rJ$nodeassert)))(infoHash.length === 20, "infoHash.length !== 20");
    const peerId = Buffer.from("00112233445566778899");
    (0, ($parcel$interopDefault($jC3rJ$nodeassert)))(peerId.length === 20, "peerId.length !== 20");
    const handshake = Buffer.concat([
        prefix,
        reserved,
        infoHash,
        peerId
    ]);
    return handshake;
}
function $38153ead2db24425$var$getHandshakePrefix() {
    const length = Buffer.from([
        19
    ]);
    (0, ($parcel$interopDefault($jC3rJ$nodeassert)))(length.length === 1, "length.length !== 1");
    const protocol = Buffer.from("BitTorrent protocol");
    (0, ($parcel$interopDefault($jC3rJ$nodeassert)))(protocol.length === 19, "protocol.length !== 19");
    const prefix = Buffer.concat([
        length,
        protocol
    ]);
    return prefix;
}
function $38153ead2db24425$export$e25f39df76216b38(data) {
    if (data.length < 68) return false;
    const prefix = $38153ead2db24425$var$getHandshakePrefix();
    for(let i = 0; i < prefix.length; i++){
        if (data[i] !== prefix[i]) return false;
    }
    return true;
}




var $89331aaf2ca9d62f$export$5eb068567d1a68bc;
(function(MessageId) {
    MessageId[MessageId["Choke"] = 0] = "Choke";
    MessageId[MessageId["Unchoke"] = 1] = "Unchoke";
    MessageId[MessageId["Interested"] = 2] = "Interested";
    MessageId[MessageId["NotInterested"] = 3] = "NotInterested";
    MessageId[MessageId["Have"] = 4] = "Have";
    MessageId[MessageId["Bitfield"] = 5] = "Bitfield";
    MessageId[MessageId["Request"] = 6] = "Request";
    MessageId[MessageId["Piece"] = 7] = "Piece";
    MessageId[MessageId["Cancel"] = 8] = "Cancel";
})($89331aaf2ca9d62f$export$5eb068567d1a68bc || ($89331aaf2ca9d62f$export$5eb068567d1a68bc = {}));
class $89331aaf2ca9d62f$export$f69c19e57285b83a {
    constructor(buffer){
        this.raw = buffer;
        this.msgLen = $89331aaf2ca9d62f$export$f69c19e57285b83a.getMessageLength(buffer);
        this.id = $89331aaf2ca9d62f$export$f69c19e57285b83a.getMessageId(buffer);
        this.payload = $89331aaf2ca9d62f$export$f69c19e57285b83a.getMessagePayload(buffer);
        (0, ($parcel$interopDefault($jC3rJ$nodeassert)))($89331aaf2ca9d62f$export$5eb068567d1a68bc[this.id], `bad id: ${this.id}`);
        (0, ($parcel$interopDefault($jC3rJ$nodeassert)))(this.msgLen === this.payload.length + 1, `length ${this.msgLen} !== payload.length ${this.payload.length} + 1`);
    }
    isA(id) {
        return this.id === id;
    }
    toString() {
        return `Message(id: ${$89331aaf2ca9d62f$export$5eb068567d1a68bc[this.id]}, payload: ${this.msgLen - 1}b)`;
    }
    static isKeepAlive(data) {
        return data.length === 4 && $89331aaf2ca9d62f$export$f69c19e57285b83a.getMessageLength(data) === 0;
    }
    static getDebugType(data) {
        if ($89331aaf2ca9d62f$export$f69c19e57285b83a.isKeepAlive(data)) return "keep-alive";
        const id = $89331aaf2ca9d62f$export$f69c19e57285b83a.getMessageId(data);
        if ($89331aaf2ca9d62f$export$5eb068567d1a68bc[id]) return $89331aaf2ca9d62f$export$5eb068567d1a68bc[id];
        if ((0, $38153ead2db24425$export$e25f39df76216b38)(data)) return "handshake";
        return "";
    }
    static getMessageId(data) {
        return data.readInt8(4);
    }
    static getMessageLength(data) {
        return data.readInt32BE(0);
    }
    static getMessagePayload(data) {
        return data.subarray(5);
    }
    static makeSendBuffer(id, payload) {
        (0, ($parcel$interopDefault($jC3rJ$nodeassert)))($89331aaf2ca9d62f$export$5eb068567d1a68bc[id], `bad id: ${id}`);
        const payloadLen = payload?.length ?? 0;
        const buffer = Buffer.alloc(5 + payloadLen);
        buffer.writeUInt32BE(1 + payloadLen, 0);
        buffer.writeUInt8(id, 4);
        if (payloadLen) payload.copy(buffer, 5);
        return buffer;
    }
}



function $848fcf8f03b5d1e1$export$198f1d546df1bebf(torrent, pieceNum) {
    const pieceLen = $848fcf8f03b5d1e1$export$9c65e2e4ea37d3e2(torrent, pieceNum);
    const blocks = $848fcf8f03b5d1e1$var$getBlocks(pieceLen);
    let total = 0;
    for (const b of blocks)total += b;
    (0, ($parcel$interopDefault($jC3rJ$assert)))(total === pieceLen, `total ${total} !== pieceLen ${torrent.info.length}, pieceNum: ${pieceNum}, info['piece length']: ${torrent.info["piece length"]}]`);
    return blocks;
}
function $848fcf8f03b5d1e1$export$9c65e2e4ea37d3e2(torrent, pieceNum) {
    (0, ($parcel$interopDefault($jC3rJ$assert)))(pieceNum < torrent.pieceHashes.length, `utils: index out of bounds: pieceNum ${pieceNum}, torrent.pieceHashes.length ${torrent.pieceHashes.length}`);
    const isLast = pieceNum === torrent.pieceHashes.length - 1;
    const pieceLen = isLast ? torrent.info.length % torrent.info["piece length"] : torrent.info["piece length"];
    return pieceLen;
}
function $848fcf8f03b5d1e1$var$getBlocks(remainingSize, blockSize = 16384, accum) {
    const nextBlock = remainingSize > blockSize ? blockSize : remainingSize;
    (0, ($parcel$interopDefault($jC3rJ$assert)))(nextBlock <= remainingSize, `nextBlock ${nextBlock} > remainingSize ${remainingSize}`);
    return nextBlock === remainingSize ? [
        ...accum ?? [],
        nextBlock
    ] : $848fcf8f03b5d1e1$var$getBlocks(remainingSize - nextBlock, blockSize, [
        ...accum ?? [],
        nextBlock
    ]);
}
function $848fcf8f03b5d1e1$export$666252b437cce0c7(m) {
    return $848fcf8f03b5d1e1$export$4792e48abc550fa1(m * 60);
}
function $848fcf8f03b5d1e1$export$4792e48abc550fa1(s) {
    return s * 1000;
}


var $a1d9e98063dd4481$var$State;
(function(State) {
    State["Unconnected"] = "unconnected";
    State["Connected"] = "connected";
    State["Handshaked"] = "handshaked";
    State["Downloading"] = "downloading";
    State["Error"] = "error";
    State["Closed"] = "closed";
})($a1d9e98063dd4481$var$State || ($a1d9e98063dd4481$var$State = {}));
const $a1d9e98063dd4481$var$DEFAULT_WAIT = (0, $848fcf8f03b5d1e1$export$4792e48abc550fa1)(60);
class $a1d9e98063dd4481$export$d84cf184fade0488 {
    constructor(torrent, peer){
        this.torrent = torrent;
        this.peer = peer;
        this.received = [];
        this.state = "unconnected";
        this.bitfield = null;
        this.choke = true;
        this.close = async ()=>{
            console.error(`Closing connection to ${this.peer}`);
            this.received.length = 0;
            if (![
                "error",
                "closed"
            ].includes(this.state)) this.state = "closed";
            this.socket?.destroy();
        };
        this.getDebugBufferStr = (buffer)=>{
            const debugStr = `${buffer.length}b\t${(0, $89331aaf2ca9d62f$export$f69c19e57285b83a).getDebugType(buffer)}\t`;
            return debugStr;
        };
        this.handleData = (data)=>{
            console.error(`Rx ${this.getDebugBufferStr(data)}`, data);
            this.received.push(data);
        };
        this.handleError = (err)=>{
            console.error("Error", err);
            this.state = "error";
        };
        this.handleClose = ()=>{
            console.error("Closed");
            if (this.state !== "error") this.state = "closed";
        };
        this.getNextMessage = async (maxWait = $a1d9e98063dd4481$var$DEFAULT_WAIT * 10)=>{
            const firstBuff = await this.getNextBuffer(maxWait);
            const statedMessageLen = firstBuff.readInt32BE(0);
            const statedMessageId = firstBuff.readInt8(4);
            (0, ($parcel$interopDefault($jC3rJ$nodeassert)))(statedMessageLen >= firstBuff.length - 5, `statedPayloadLen: ${statedMessageLen}, buff.length: ${firstBuff.length}`);
            if (firstBuff.length - 4 === statedMessageLen) {
                const msg = new (0, $89331aaf2ca9d62f$export$f69c19e57285b83a)(firstBuff);
                return msg;
            }
            console.error(`Got partial payload for message type ${statedMessageId}, received: ${firstBuff.length - 4} of ${statedMessageLen}`);
            const totalBuff = Buffer.alloc(statedMessageLen + 4);
            firstBuff.copy(totalBuff, 0);
            let iterationLimit = 10;
            let copied = firstBuff.length;
            do {
                const left = totalBuff.length - copied;
                console.error(`Copied ${(copied / totalBuff.length * 100).toFixed(0)}%  ${copied} of ${totalBuff.length}, remaining: ${left} `);
                (0, ($parcel$interopDefault($jC3rJ$nodeassert)))(iterationLimit-- > 0, `too many iterations`);
                const next = await this.getNextBuffer(maxWait);
                if ((0, $89331aaf2ca9d62f$export$f69c19e57285b83a).isKeepAlive(next)) {
                    console.error(`Got keep-alive while waiting for more data in same block, continuing`);
                    continue;
                }
                next.copy(totalBuff, copied);
                copied += next.length;
            }while (copied < totalBuff.length);
            (0, ($parcel$interopDefault($jC3rJ$nodeassert)))(copied === totalBuff.length, `copied ${copied} !== totalBuff.length ${totalBuff.length}}`);
            return new (0, $89331aaf2ca9d62f$export$f69c19e57285b83a)(totalBuff);
        };
        this.getNextBuffer = async (maxWait = $a1d9e98063dd4481$var$DEFAULT_WAIT)=>{
            // hack - seems like there should be a way to wrap the socket handler in an async generator
            return new Promise((resolve, reject)=>{
                const current = this.received.shift();
                if (current) {
                    // console.error(`No wait`);
                    resolve(current);
                    return;
                }
                const cancelLimit = setTimeout(()=>{
                    reject(new Error(`Timeout, waited longer than ${maxWait}ms`));
                }, maxWait);
                const cancelCheck = setInterval(()=>{
                    // process.stderr.write(`.`);
                    if ([
                        "error",
                        "closed"
                    ].includes(this.state) && // the connection could be closed before the interval allows the consumer to pop the buffered message(s)
                    !this.received.length) {
                        // process.stderr.write(`\n`);
                        clearInterval(cancelCheck);
                        clearTimeout(cancelLimit);
                        reject(new Error(`getNextBuffer() -> cancelCheck -> state: ${this.state}, received.length: ${this.received.length}`));
                        return;
                    }
                    const current = this.received.shift();
                    if (current) {
                        // process.stderr.write(`\n`);
                        resolve(current);
                        clearInterval(cancelCheck);
                        clearTimeout(cancelLimit);
                    }
                }, 100);
            });
        };
    }
    async downloadSinglePiece(pieceNum) {
        (0, ($parcel$interopDefault($jC3rJ$nodeassert)))(pieceNum >= 0, `pieceNum ${pieceNum} < 0`);
        (0, ($parcel$interopDefault($jC3rJ$nodeassert)))(pieceNum < this.torrent.pieceHashes.length, `downloadSinglePiece: index out of bounds: pieceNum ${pieceNum}, pieceHashes.length ${this.torrent.pieceHashes.length}`);
        if (this.state !== "handshaked") await this.handshake();
        this.state = "downloading";
        console.error(`Attempting download of piece ${pieceNum} of ${this.torrent.pieceHashes.length} from peer ${this.peer}`);
        // instructions: wait for bitfield
        // get to state where we can request piece
        {
            await this.sendMessage((0, $89331aaf2ca9d62f$export$5eb068567d1a68bc).Interested);
            let msg = await this.getNextMessage((0, $848fcf8f03b5d1e1$export$666252b437cce0c7)(5));
            if (msg.isA((0, $89331aaf2ca9d62f$export$5eb068567d1a68bc).Bitfield)) {
                this.bitfield = msg;
                // instructions: send interested
                msg = await this.getNextMessage((0, $848fcf8f03b5d1e1$export$666252b437cce0c7)(5));
            }
            (0, ($parcel$interopDefault($jC3rJ$nodeassert)))(msg.isA((0, $89331aaf2ca9d62f$export$5eb068567d1a68bc).Unchoke), "expected unchoke");
            this.choke = false;
        }
        // const expectedPieceLen = getPieceLength(this.torrent, pieceNum);
        const blocks = [];
        const blockLens = (0, $848fcf8f03b5d1e1$export$198f1d546df1bebf)(this.torrent, pieceNum);
        const baseBlockLen = blockLens[0];
        let blockOffset = 0;
        let copied = 0;
        for(let i = 0; i < blockLens.length; i++){
            const blockLen = blockLens[i];
            console.error(`Sending request for piece ${pieceNum}, block ${i}/${blockLens.length} offset ${blockOffset}, block length ${blockLen}`);
            await this.sendRequest(pieceNum, blockOffset, blockLen);
            const pieceMsg = await this.getNextMessage((0, $848fcf8f03b5d1e1$export$666252b437cce0c7)(5));
            (0, ($parcel$interopDefault($jC3rJ$nodeassert)))(pieceMsg.isA((0, $89331aaf2ca9d62f$export$5eb068567d1a68bc).Piece), `expected piece, got: ${pieceMsg}`);
            console.error(`Piece message for p${pieceNum} b${i} ${pieceMsg}`, pieceMsg.payload);
            // maybe this would need to be relaxed if we're pipelining
            const rcvdPieceNum = pieceMsg.payload.readInt32BE(0);
            (0, ($parcel$interopDefault($jC3rJ$nodeassert)))(rcvdPieceNum === pieceNum, `rcvdPieceNum ${rcvdPieceNum} !== pieceNum ${pieceNum}`);
            const rcvdOffset = pieceMsg.payload.readInt32BE(4);
            // assert(rcvdOffset === i, `offset ${rcvdOffset} does not match expected block number ${i}`);
            blockOffset = rcvdOffset + baseBlockLen;
            const rcvdPayload = pieceMsg.payload.subarray(8);
            (0, ($parcel$interopDefault($jC3rJ$nodeassert)))(rcvdPayload.length === blockLen, `rcvdPayload.length ${rcvdPayload.length} !== blockLen ${blockLen}`);
            blocks[i] = rcvdPayload;
            copied += rcvdPayload.length;
        }
        const pieceBuff = Buffer.concat(blocks);
        console.error(`Piece buffer p${pieceNum} size ${pieceBuff.length}b (copied: ${copied})`, pieceBuff);
        // validate post conditions
        {
            (0, ($parcel$interopDefault($jC3rJ$nodeassert)))(copied === pieceBuff.length, `copied ${copied} !== pieceBuff.length ${pieceBuff.length}`);
            // sha1
            const hasher = (0, ($parcel$interopDefault($jC3rJ$nodecrypto))).createHash("sha1");
            hasher.update(pieceBuff);
            const sha1 = hasher.digest("hex");
            (0, ($parcel$interopDefault($jC3rJ$nodeassert)))(sha1 === this.torrent.pieceHashes[pieceNum], `sha1 ${sha1} !== expected ${this.torrent.pieceHashes[pieceNum]}`);
        }
        return pieceBuff;
    }
    async handshake(maxWait = $a1d9e98063dd4481$var$DEFAULT_WAIT) {
        (0, ($parcel$interopDefault($jC3rJ$nodeassert)))(this.state === "unconnected" || this.state === "connected", `handshake started in state: ${this.state}`);
        if (this.state !== "connected") await this.connect();
        (0, ($parcel$interopDefault($jC3rJ$nodeassert)))(this.state === "connected", `handshake started in state: ${this.state}`);
        const clientHandshake = (0, $38153ead2db24425$export$74f755347fc62200)(this.torrent);
        console.error(`Tx ${this.getDebugBufferStr(clientHandshake)}`, clientHandshake);
        await new Promise((resolve, reject)=>{
            this.socket.write(clientHandshake, (err)=>{
                if (err) reject(err);
                else resolve();
            });
        });
        // assume return handshake fits in one data
        const serverHandshake = await this.getNextBuffer(maxWait);
        const parsed = (0, $38153ead2db24425$export$ba6075743c6fa6a5)(serverHandshake);
        return parsed;
    }
    connect(maxWait = $a1d9e98063dd4481$var$DEFAULT_WAIT) {
        (0, ($parcel$interopDefault($jC3rJ$nodeassert)))(this.state === "unconnected", `connect started in state: ${this.state}`);
        const [host, portStr] = this.peer.split(":");
        const port = Number.parseInt(portStr, 10);
        if (!(Number.isSafeInteger(port) && port > 0)) throw new Error(`bad port: ${portStr}`);
        const conn = this;
        return new Promise((resolve, reject)=>{
            const timeout = setTimeout(()=>{
                reject(new Error(`Connection to ${this.peer} timed out after ${maxWait}ms}`));
                conn.state = "error";
            }, maxWait);
            conn.socket = new (0, $jC3rJ$nodenet.Socket)().on("data", this.handleData).on("close", this.handleClose).on("error", this.handleError).connect(port, host, ()=>{
                console.error(`Connected to peer ${this.peer}`);
                conn.state = "connected";
                clearTimeout(timeout);
                resolve();
            });
        });
    }
    async sendRequest(piece = 0, blockOffset = 0, blockLen = 16384) {
        if (this.choke) throw new Error("sent request while choked");
        const req = Buffer.alloc(12);
        req.writeUInt32BE(piece, 0);
        req.writeUInt32BE(blockOffset, 4);
        req.writeUInt32BE(blockLen, 8);
        return this.sendMessage((0, $89331aaf2ca9d62f$export$5eb068567d1a68bc).Request, req);
    }
    async sendMessage(id, payload) {
        const buffer = (0, $89331aaf2ca9d62f$export$f69c19e57285b83a).makeSendBuffer(id, payload);
        return new Promise((resolve, reject)=>{
            this.socket.write(buffer, (err)=>{
                const debugStr = this.getDebugBufferStr(buffer);
                if (err) {
                    console.error(`Error Tx ${debugStr}`, buffer);
                    reject(err);
                } else {
                    console.error(`Tx ${debugStr}`, buffer);
                    resolve();
                }
            });
        });
    }
}




function $9bf045ca92c3524d$export$4812e460280c6ef2(arr) {
    const index = Math.floor(Math.random() * arr.length);
    return arr[index];
}


async function $b9842ed8432bf47f$export$1ad2ea65d0e037bb(saveFile, torrentFile, pieceNum) {
    await $b9842ed8432bf47f$export$92da34fce2b60aac(saveFile, torrentFile, pieceNum);
    return `Piece ${pieceNum} downloaded to ${saveFile}.`;
}
async function $b9842ed8432bf47f$export$92da34fce2b60aac(saveFile, torrentFile, pieceNum) {
    const info = (0, $0a38c752b5042f46$export$c73dcf559dad2f44)(torrentFile);
    const peersResp = await (0, $1f1932f95910f014$export$a8157895bd9c53da)(torrentFile);
    const peer = (0, $9bf045ca92c3524d$export$4812e460280c6ef2)(peersResp.peers);
    const conn = new (0, $a1d9e98063dd4481$export$d84cf184fade0488)(info, peer);
    try {
        const piece = await conn.downloadSinglePiece(pieceNum);
        // const piece = await Promise.race(
        //   peersResp.peers.map(async (peer) => {
        //     const conn = new PeerConnection(info, peer);
        //     const piece = await conn.downloadSinglePiece(pieceNum);
        //     return piece;
        //   }),
        // );
        // ideally we could stream the piece into the file but that's more involved
        // since we validate the sha1. this should be fine since we're only writing a piece at a time
        await (0, ($parcel$interopDefault($jC3rJ$nodefspromises))).writeFile(saveFile, piece);
        console.error(`saved piece ${pieceNum} to ${saveFile}`);
    } finally{
        conn.close();
    }
}
async function $b9842ed8432bf47f$export$6d39d6fea29b6ff5(saveFile, torrentFile) {
    await $b9842ed8432bf47f$export$24422be91ad4011f(saveFile, torrentFile);
    return `Downloaded ${torrentFile} to ${saveFile}.`;
}
async function $b9842ed8432bf47f$export$24422be91ad4011f(saveFile, torrentFile) {
    const info = (0, $0a38c752b5042f46$export$c73dcf559dad2f44)(torrentFile);
    const peersResp = await (0, $1f1932f95910f014$export$a8157895bd9c53da)(torrentFile);
    // for a real torrent :
    // - the entire buffer may not fit in memory
    // - parallel
    const pieces = [];
    for(let i = 0; i < info.pieceHashes.length; i++)for(let j = 0; j < 3; ++j){
        if (pieces[i]) continue;
        const peer = (0, $9bf045ca92c3524d$export$4812e460280c6ef2)(peersResp.peers);
        const conn = new (0, $a1d9e98063dd4481$export$d84cf184fade0488)(info, peer);
        try {
            const piece = await conn.downloadSinglePiece(i);
            pieces[i] = piece;
        } catch (e) {
            console.error(`Error (try:${j}) on piece ${i}: ${e.message}`);
        } finally{
            conn.close();
        }
        await new Promise((resolve)=>setTimeout(resolve, 200));
    }
    for(let i = 0; i < info.pieceHashes.length; i++)(0, ($parcel$interopDefault($jC3rJ$nodeassert)))(pieces[i], `missing piece ${i}`);
    const fileBuffer = Buffer.concat(pieces);
    (0, ($parcel$interopDefault($jC3rJ$nodeassert)))(fileBuffer.length === info.info.length, `wrong length: fileBuffer ${fileBuffer.length} !== info ${info.info.length}`);
    await (0, ($parcel$interopDefault($jC3rJ$nodefspromises))).writeFile(saveFile, fileBuffer);
    console.error(`saved ${torrentFile} to ${saveFile}`);
}






async function $2ff16d2e43a79b67$export$e90fdf5f0bf87fd(file, peer) {
    const conn = new (0, $a1d9e98063dd4481$export$d84cf184fade0488)((0, $0a38c752b5042f46$export$c73dcf559dad2f44)(file), peer);
    const { peerIdHex: peerIdHex } = await conn.handshake();
    await conn.close();
    return `Peer ID: ${peerIdHex}`;
}






async function $3f97e85369539468$export$f22da7240b7add18() {
    const command = process.argv[2];
    switch(command){
        case "decode":
            {
                const bencodedValue = process.argv[3];
                console.log((0, $e4e5653eb30567a4$export$da4f2b68efa4c4b)(bencodedValue));
                break;
            }
        case "info":
            {
                const file = process.argv[3];
                console.log((0, $0a38c752b5042f46$export$af06c3af5bd98cb4)(file));
                break;
            }
        case "peers":
            {
                const file = process.argv[3];
                console.log(await (0, $1f1932f95910f014$export$f05eafe0156b3b47)(file));
                break;
            }
        case "handshake":
            {
                const file = process.argv[3];
                const peer = process.argv[4];
                console.log(await (0, $2ff16d2e43a79b67$export$e90fdf5f0bf87fd)(file, peer));
                break;
            }
        case "download_piece":
            {
                const flag = process.argv[3];
                const saveFile = process.argv[4];
                const torrentFile = process.argv[5];
                const piece = process.argv[6];
                if (flag !== "-o") throw new Error(`Expected flag -o, got ${flag}`);
                const pieceNum = Number.parseInt(piece, 10);
                if (!(Number.isSafeInteger(pieceNum) && pieceNum >= 0)) throw new Error(`bad piece: ${piece}`);
                console.log(await (0, $b9842ed8432bf47f$export$1ad2ea65d0e037bb)(saveFile, torrentFile, pieceNum));
                break;
            }
        case "download":
            {
                const flag = process.argv[3];
                const saveFile = process.argv[4];
                const torrentFile = process.argv[5];
                if (flag !== "-o") throw new Error(`Expected flag -o, got ${flag}`);
                console.log(await (0, $b9842ed8432bf47f$export$6d39d6fea29b6ff5)(saveFile, torrentFile));
                break;
            }
        default:
            throw new Error(`Unknown command: ${command}`);
    }
}




(0, $3f97e85369539468$export$f22da7240b7add18)().catch((e)=>{
    console.error(e);
    process.exit(1);
});


//# sourceMappingURL=main.js.map
