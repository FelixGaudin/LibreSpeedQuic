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
cp speedtest/speedtest-worker.js nginx-1.16.1/html/
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


Finaly, if you restart your server, the speedtest should work !

![](https://media.discordapp.net/attachments/669931364149100554/895982712022794240/unknown.png)