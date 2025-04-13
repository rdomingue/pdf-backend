const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Autoriser ton StackBlitz (ou tout le monde pour tester)
app.use(cors({ origin: '*' }));
app.use(bodyParser.json());

// Endpoint PDF
app.post('/api/export-pdf', async (req, res) => {
  const data = req.body;

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Dynamique : on génère le PDF avec les données reçues du front
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Profil PDF</title>
        <style>
          body { font-family: sans-serif; padding: 20px; }
          h1 { color: #333; }
          p { margin: 0 0 8px; }
        </style>
      </head>
      <body>
        <h1>Fiche Profil</h1>
        <p><strong>Prénom :</strong> ${data.prenom}</p>
        <p><strong>Nom :</strong> ${data.nom}</p>
        <p><strong>Email :</strong> ${data.email}</p>
        <p><strong>Téléphone :</strong> ${data.telephone}</p>
        <p><strong>Adresse :</strong> ${data.adresse}, ${data.ville}, ${data.province}, ${data.postal}</p>
        <p><strong>Type de compte :</strong> ${data.compte}</p>
        <p><strong>Préférences :</strong> ${(data.preferences || []).join(', ')}</p>
        <p><strong>Commentaires :</strong> ${data.commentaire}</p>
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la génération du PDF.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur en écoute sur port ${PORT}`);
});