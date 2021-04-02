const fs = require('fs');
const parser = require('xml2json');
const server = require('./server');

fs.readFile('./sitemap.xml', 'utf8', (err, data) => {
    // console.log(data);
    let json = parser.toJson(data)
    json = JSON.parse(json);
    // console.log(json);
    // let xml = parser.toXml(json);
    // console.log(xml);

    let ul = "",
        li = "",
        a = "";

    json.urlset.url.forEach(u => {
        // console.log(u);

        let name = u.loc;
        name = name.replace('https://1ajob.com', '');
        name = name.replace('/seeker/', '');
        name = name.replace('/employer/', '');
        name = name.replace('sitemaps/', '');
        name = name.replace(/[-.]/g, ' ');
        name = name.replace('/', '');
        // name = name.split('/')[1];

        a = `<a href="${u.loc.replace('https://1ajob.com','http://localhost:4400')}" class="text-capitalize">${name ? name : "Home"}</a>`;
        li += `<li>${a}</li>\n`;
    });

    ul = `<ul class="list-3 color">${li}</ul>`;

    console.log(ul);

    // fs.writeFileSync(__dirname + '\\', ul);
    // fs.createWriteStream('./', ul)

    var writeStream = fs.createWriteStream("urls.html");
    // fs.writeFile(las)
    writeStream.write(ul);
    writeStream.end();
});