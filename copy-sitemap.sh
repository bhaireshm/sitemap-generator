# Copy Updated Jobs XML file to 1aJob folder
# chmod 777 /opt/sitemap/jobs-sitemap.xml
# chmod 777 /var/www/wannajob/src/sitemaps/jobs-sitemap.xml
cp -f /opt/sitemap/jobs-sitemap.xml /var/www/wannajob/src/sitemaps/jobs-sitemap.xml

# Copy Updated Companies XML file to 1aJob folder 
# cp -f /var/opt/sitemap-creator/companies-sitemap.xml /var/opt/wannajob/src/sitemaps/companies-sitemap.xml