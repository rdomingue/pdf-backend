const express = require('express');

const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Autoriser ton StackBlitz (ou tout le monde pour tester)
const cors = require('cors');
app.use(cors());
app.use(bodyParser.json());

// Endpoint PDF
app.post('/api/export-pdf', async (req, res) => {
  const data = req.body;

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      timeout: 30000,  // 30 secondes de timeout pour démarrer le navigateur
    });
    const page = await browser.newPage();

    // Dynamique : on génère le PDF avec les données reçues du front
    const htmlContent = `
    <!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Formulaire Complexe</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 text-gray-800 py-10 px-4">
  <div class="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
    <h1 class="text-2xl font-bold mb-6">Formulaire de Profil Avancé</h1>
    <form class="space-y-6" method="POST" enctype="multipart/form-data">

      <!-- Informations personnelles -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium">Prénom</label>
          <input name="prenom" type="text" required class="w-full mt-1 p-2 border rounded" value="${data.prenom}" />
        </div>
        <div>
          <label class="block text-sm font-medium">Nom</label>
          <input name="nom" type="text" required class="w-full mt-1 p-2 border rounded" value="${data.nom}"/>
        </div>
        <div>
          <label class="block text-sm font-medium">Email</label>
          <input name="email" type="email" required class="w-full mt-1 p-2 border rounded" value="${data.email}"/>
        </div>
        <div>
          <label class="block text-sm font-medium">Téléphone</label>
          <input name="telephone" type="tel" class="w-full mt-1 p-2 border rounded" value="${data.telephone}" />
        </div>
      </div>

      <!-- Adresse -->
      <div>
        <label class="block text-sm font-medium">Adresse</label>
        <input name="adresse" type="text" required class="w-full mt-1 p-2 border rounded" value="${data.adresse}" />
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium">Ville</label>
          <input name="ville" type="text" required class="w-full mt-1 p-2 border rounded" value="${data.ville}" />
        </div>
        <div>
          <label class="block text-sm font-medium">Province</label>
           <input name="province" type="text" required class="w-full mt-1 p-2 border rounded" value="${data.province}" />
        </div>
        <div>
          <label class="block text-sm font-medium">Code postal</label>
          <input name="postal" type="text" required class="w-full mt-1 p-2 border rounded" value="${data.postal}" />
        </div>
      </div>

      <!-- Préférences -->
      <div>
        <label class="block text-sm font-medium mb-2">Préférences de contact</label>
        <div class="flex gap-4">
         <input name="preferences" type="text" required class="w-full mt-1 p-2 border rounded" value="${data.preferences}" />
        </div>
      </div>

      <!-- Type de compte -->
      <div>
        <label class="block text-sm font-medium mb-2">Type de compte</label>
        <div class="flex gap-4">
         <input name="compte" type="text" required class="w-full mt-1 p-2 border rounded" value="${data.compte}" />
        </div>
      </div>


      <!-- Commentaires -->
      <div>
        <label class="block text-sm font-medium mb-1">Commentaires</label>
        <textarea name="commentaire" rows="4" class="w-full p-2 border rounded" value="${data.commentaire}"></textarea>
      </div>

      <!-- Soumission -->
      <div>
        <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">Soumettre</button>
      </div>
    </form>
  </div>
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