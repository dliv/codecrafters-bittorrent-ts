import http from 'node:http';
import url from 'node:url';

export function httpGetBuffer(requestUrl: string, maxRedirects = 7): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    http
      .get(requestUrl, (res) => {
        const isRedirect = res.statusCode === 301 || res.statusCode === 302;
        if (isRedirect && maxRedirects < 1) {
          return reject(new Error('Too many redirects'));
        } else if (isRedirect) {
          const newLocation = res.headers.location;
          const newUrl =
            newLocation.startsWith('http://') || newLocation.startsWith('https://')
              ? newLocation
              : new url.URL(newLocation, requestUrl).href;
          return httpGetBuffer(newUrl, maxRedirects - 1)
            .then(resolve)
            .catch(reject);
        }

        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error('StatusCode=' + res.statusCode + ` url=${url}`));
        }

        const chunks = [];

        res.on('data', (chunk) => {
          chunks.push(chunk);
        });

        res.on('end', () => {
          const buffer = Buffer.concat(chunks);
          resolve(buffer);
        });
      })
      .on('error', (err) => {
        reject(err);
      });
  });
}
