This folder should contain your certificate file and your key file, named with the `hostname` set in your `json\local.secure.json` file.

For example, for `"hostname" : "localhost",` this folder should contain:
 - `localhost-key.pem` : the key file
 - `localhost.pem` : the certificate file

 I was able to generate these using the `mkcert` program (from https://github.com/FiloSottile/mkcert), using the commands `mkcert localhost` and `mkcert -install`.
 