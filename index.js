const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.post('/api/export-pdf', async (req, res) => {
  const data = req.body;

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  const htmlContent = `
    <html>
      <body>
        <h1>Profil PDF</h1>
        <p>Nom : ${data.prenom} ${data.nom}</p>
        <p>Email : ${data.email}</p>
        <p>Téléphone : ${data.telephone}</p>
      </body>
    </html>
  `;

  await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
  const pdfBuffer = await page.pdf({ format: 'A4' });

  await browser.close();

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': 'attachment; filename="profil.pdf"'
  });

  res.send(pdfBuffer);
});

app.listen(PORT, () => console.log(`PDF backend running on port ${PORT}`));