curl -O https://nginx.org/download/nginx-1.16.1.tar.gz
tar xzvf nginx-1.16.1.tar.gz
git clone --recursive https://github.com/cloudflare/quiche
cd nginx-1.16.1
patch -p01 < ../quiche/extras/nginx/nginx-1.16.patch
bash configure                                 \
    --prefix=$PWD                           \
    --build="quiche-$(git --git-dir=../quiche/.git rev-parse --short HEAD)" \
    --with-http_ssl_module                  \
    --with-http_v2_module                   \
    --with-http_v3_module                   \
    --with-openssl=../quiche/deps/boringssl \
    --with-quiche=../quiche                  \
    --with-pcre

# \begin{spaghetti}
makefile_content=$(python3 ../builders/nginx_patch.py)
rm objs/Makefile
echo "$makefile_content" > objs/Makefile
# \end{spaghetti}
# Should be replace with smtg with the `sed` command but it didn't worked

make && make install