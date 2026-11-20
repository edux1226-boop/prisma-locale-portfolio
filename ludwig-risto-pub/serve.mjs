import http from 'node:http';import {readFileSync} from 'node:fs';
http.createServer((q,r)=>{r.writeHead(200,{'content-type':'text/html; charset=utf-8'});r.end(readFileSync(new URL('./index.html',import.meta.url)))}).listen(4400);
