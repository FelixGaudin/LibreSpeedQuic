# LibreSpeedQuic

> Gaudin Félix & Giot Adrien

## Project structure 

```
├── backend/         : modified backend of librespeed in node JS
├── builders/        : bash file to automatically install Nginx with the Quiche patch
├── first_draft/     : first draft of this project
├── frontend/        : modified version of librespeed
└── stats/           : files for the statistics
```

## Goal of the project

[Librespeed](https://librespeed.org/) provides an open-source speedtest like server that runs above TCP. The
objective of this project is to deploy this test suite on a QUIC server (e.g. nginx using cloudflare’s quiche) and
explore the performance of QUIC when doing such speedtests.

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

To perform more test we modified a bit the original files. They are in the folder `frontend`. To use them, you can just redirect the nginx root folder to it.

## Modify the Nginx config

In order to enable HTTP/3 in `Nginx` you have to modify the config file. It's located in `nginx-1.16.1/conf/nginx.conf`.

We made an example file (`nginx_example.conf`).

### Case of 403 : Forbiden erreur 

This may mean that your html files are in a folder with to strict permissions. First try this https://linuxhint.com/fix-nginx-403-forbidden/. It may not work, so just put the html files in a *normal* file (eg : /home/) and then use this https://stackoverflow.com/questions/10631933/nginx-static-file-serving-confusion-with-root-alias



![](https://media.discordapp.net/attachments/669931364149100554/895982712022794240/unknown.png)
