#!/bin/bash

# Deploys the Font Awesome files for HB self-hosting to settle various issues.

THEURL=https://use.fontawesome.com/releases/v6.7.2/fontawesome-free-6.7.2-web.zip
THEFILE=fontawesome-free-6.7.2-web.zip
if [ ! "$(which wget)" ]; then
   echo "Please manually download ${THEURL}"
   exit -1
fi

wget ${THEURL}
if [ $? -ne 0 ]; then
  echo "Error downloading ${THEURL}"
  exit -2
fi

if [ ! "$(which unzip)" ]; then
  echo "Please unzip the file with your tool of choice."
  exit -3
fi

unzip fontawesome-free-6.7.2-web.zip
if [ $? -ne 0 ]; then
  echo "Error extracting ${THEFILE}"
fi

echo "Copying fonts"
cp -rv  fontawesome-free-*-web/webfonts/*.woff2 ../themes/fonts/iconFonts
echo "Copying and updating css"

echo "fontawesome-free.less"
sed  's/..\/webfonts/\/fonts\/iconFonts/g' fontawesome-free-*-web/css/fontawesome.css > ../themes/fonts/iconFonts/fontawesome-free.less

echo "fontawesome-solid.less"
sed  's/..\/webfonts/\/fonts\/iconFonts/g' fontawesome-free-*-web/css/solid.css > ../themes/fonts/iconFonts/fontawesome-solid.less

echo "fontawesome-brands.less"
sed  's/..\/webfonts/\/fonts\/iconFonts/g' fontawesome-free-*-web/css/brands.css > ../themes/fonts/iconFonts/fontawesome-brands.less

echo "fontawesome-regular.less"
sed  's/..\/webfonts/\/fonts\/iconFonts/g' fontawesome-free-*-web/css/regular.css > ../themes/fonts/iconFonts/fontawesome-regular.less
