rm -rf ./out

pnpm next export

find ./out -type f -exec sed -i 's/\/_next/\/sitedata/g' {} +

mv ./out/_next ./out/sitedata
