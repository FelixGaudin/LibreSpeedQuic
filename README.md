# Librespeed with QUIC
Inspired by https://github.com/cloudflare/quiche/tree/master/extras/nginx
## Installation

### Nginx with Quiche
In this step we will install a specifique version of nginx with a patch in order to support QUIC.

1. Install Rust

We must have a version of rust >=1.53 (use `rustc -V` to know the version) if you don't have it juste use :
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh 
```
Than you have to add the `cargo` binaries to your binary files :
```bash
sudo ln -s ~/.cargo/bin/cargo /bin/
```

2. Install PCRE

This will be used to configure Nginx :

```bash
sudo apt-get install libpcre3 libpcre3-dev
```

3. Download Nginx with the right version (1.16.1)

*You may have to remove nginx if you have another version installed*

```bash
curl -O https://nginx.org/download/nginx-1.16.1.tar.gz
tar xzvf nginx-1.16.1.tar.gz
```

4. Clone the Quiche git
```bash
git clone --recursive https://github.com/cloudflare/quiche
```

5. Apply the Quiche patch to Nginx

```bash
cd nginx-1.16.1
patch -p01 < ../quiche/extras/nginx/nginx-1.16.patch
```

6. Configure Nginx

You can add more options. All options are available here : https://nginx.org/en/docs/configure.html
```bash
./configure                                 \
       --prefix=$PWD                           \
       --build="quiche-$(git --git-dir=../quiche/.git rev-parse --short HEAD)" \
       --with-http_ssl_module                  \
       --with-http_v2_module                   \
       --with-http_v3_module                   \
       --with-openssl=../quiche/deps/boringssl \
       --with-quiche=../quiche                  \
       --with-pcre
```

7. Install the modified version
You can try :
```bash
make && make install
```

If you get an error with `cp conf/koi-win ...` while running the `make install` you have to comment the line and the two below (`cp conf/koi-win ...`, `cp conf/koi-utf ...` and `cp conf/win-utf ...`) and retry the commands.

8. Test it !
You can use `./sbin/nginx` to launch the server (and `sudo killall nginx` to killit). By default the page url is at `localhost` and the default port is 80. (http://localhost:80)


## LibreSpeed
We will use the librespeed project to performe the speedtest. If you want to know more about it, please look at the project GitHub https://github.com/librespeed/speedtest .

To clone the repository :
```bash
git clone https://github.com/librespeed/speedtest.git
```

We won't use all possiblities of the project. So you can juste choose one html template (e.g. `example-singleServer-full.html`) and move it to `nginx-1.16.1/html` as `index.html`
```bash
cp speedtest/example-singleServer-full.html nginx-1.16.1/html/index.html
```

If you reload nginx, you should see the web page. But there will be an error. You have to copy the files `speedtest.js` and `speedtest-worker.js` in the same folder as the index.

```bash
cp speedtest/speedtest.js nginx-1.16.1/html/
cp speedtest/speedtest_worker.js nginx-1.16.1/html/
```

Than the speedtest still will be not working. It's because by default the webpage makes call on backend with PHP files. So we will use a PHP-free version of it (https://github.com/librespeed/speedtest/wiki/No-backend).

To procced : 
Create a subfolder named 'backend' in the html folder. (`mkdir nginx-1.16.1/html/backend`) And place there two files.
1. a file `empty.dat` (just an empty file, can be created with `mkdir nginx-1.16.1/html/backend/empty.dat`)

2. a folder with random thing inside named `garbage.dat` (you can download one from this link http://downloads.fdossena.com/geth.php?r=speedtest-bigfile)

3. Apply to the frontend :

The start of the file should contain a thing like this
```js
var s=new Speedtest(); //create speedtest object
s.setParameter("telemetry_level","basic"); //enable telemetry
``` 
We won't use telemetry so you can juste comment it or look at the librespeed doc. And we apply those parameters
```js
s.setParameter("url_dl", "backend/garbage.dat");
s.setParameter("url_ul", "backend/empty.dat");
s.setParameter("url_ping", "backend/empty.dat");
s.setParameter("test_order", "P_D_U");
```

## Modify the Nginx config

In order to enable HTTP/3 in `Nginx` you have to modify the config file. It's located in `nginx-1.16.1/conf/nginx.conf`. You can use this preset for example :
```conf
events {
    worker_connections  1024;
}

http {
    include mime.types;
    client_max_body_size 1000m;    # https://easyengine.io/tutorials/php/increase-file-upload-size-limit/
    server {
        # Enable QUIC and HTTP/3.
        listen 443 quic reuseport;

        # Enable HTTP/2 (optional).
        listen 443 ssl http2;

        ssl_certificate      localhost.crt;
        ssl_certificate_key  localhost.key;

        # Enable all TLS versions (TLSv1.3 is required for QUIC).
        ssl_protocols TLSv1 TLSv1.1 TLSv1.2 TLSv1.3;

        # Add Alt-Svc header to negotiate HTTP/3.
        add_header alt-svc 'h3=":443"; ma=86400';
    }
}
```
This config file is highly inspired by the one proposed by [CloudFlare](https://github.com/cloudflare/quiche/tree/master/extras/nginx#running). As you see it's needed to have a ssl certificate. For your local test you can make your own with [Let's Encrypt](https://letsencrypt.org/fr/docs/certificates-for-localhost/)
```bash
openssl req -x509 -out localhost.crt -keyout localhost.key \
  -newkey rsa:2048 -nodes -sha256 \
  -subj '/CN=localhost' -extensions EXT -config <( \
   printf "[dn]\nCN=localhost\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:localhost\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")
```

Finaly, if you restart your server, the speedtest should work !

![](https://media.discordapp.net/attachments/669931364149100554/895982712022794240/unknown.png)
