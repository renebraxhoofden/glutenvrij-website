// Alle producten database
const producten = [
    {
        naam: "🍞 Schär Meesterbakkers Wit Brood",
        beschrijving: "Heerlijk wit glutenvrij brood voor de hele familie",
        prijzen: [
            { winkel: "Albert Heijn", prijs: 3.19 },
            { winkel: "Jumbo", prijs: 3.29 },
            { winkel: "Glutenvrijemarkt.com", prijs: 2.95, beste: true }
        ]
    },
    {
        naam: "🍝 Consenza Fusilli Pasta",
        beschrijving: "Glutenvrije fusilli pasta van hoogwaardige ingrediënten",
        prijzen: [
            { winkel: "Albert Heijn", prijs: 2.49 },
            { winkel: "Plus", prijs: 2.39 },
            { winkel: "Glutenvrijemarkt.com", prijs: 2.29, beste: true }
        ]
    },
    {
        naam: "🍪 Gullon Digestive Koekjes",
        beschrijving: "Krokante digestive koekjes zonder gluten",
        prijzen: [
            { winkel: "Jumbo", prijs: 2.79 },
            { winkel: "Albert Heijn", prijs: 2.89 },
            { winkel: "Free From Shop", prijs: 2.69, beste: true }
        ]
    }
];

// Zoek functie
function zoekProduct() {
    const zoekTerm = document.getElementById('zoekInput').value.toLowerCase();
    const resultatenDiv = document.getElementById('zoekResultaten');
    
    if (zoekTerm.length < 2) {
        alert("⚠️ Typ minimaal 2 letters om te zoeken!");
        return;
    }
    
    // Zoek in producten
    const gevondenProducten = producten.filter(product => 
        product.naam.toLowerCase().includes(zoekTerm) ||
        product.beschrijving.toLowerCase().includes(zoekTerm)
    );
    
    if (gevondenProducten.length === 0) {
        resultatenDiv.innerHTML = `
            <div style="background-color: #ffebee; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <h3>😔 Geen producten gevonden</h3>
                <p>Probeer een andere zoekterm, bijvoorbeeld: "brood", "pasta" of "koekjes"</p>
            </div>
        `;
        return;
    }
    
    // Toon resultaten
    let html = `<h2 style="color: #2E7D32;">🎯 Zoekresultaten voor "${zoekTerm}"</h2>`;
    
    gevondenProducten.forEach(product => {
        html += maakProductHTML(product);
    });
    
    resultatenDiv.innerHTML = html;
}

// Toon alle producten
function toonAlleProducten() {
    const resultatenDiv = document.getElementById('zoekResultaten');
    
    let html = `<h2 style="color: #2E7D32;">📋 Alle Beschikbare Producten</h2>`;
    
    producten.forEach(product => {
        html += maakProductHTML(product);
    });
    
    resultatenDiv.innerHTML = html;
}

// Maak HTML voor een product
function maakProductHTML(product) {
    let prijzenHTML = '<ul>';
    
    product.prijzen.forEach(prijsInfo => {
        const besteTag = prijsInfo.beste ? ' ⭐ BESTE PRIJS' : '';
        const kleur = prijsInfo.beste ? 'color: #E65100; font-weight: bold;' : '';
        
        prijzenHTML += `<li style="${kleur}">${prijsInfo.winkel}: €${prijsInfo.prijs.toFixed(2)}${besteTag}</li>`;
    });
    
    prijzenHTML += '</ul>';
    
    return `
        <div style="background-color: white; margin: 20px 0; padding: 20px; border-radius: 8px; 
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1); border-left: 5px solid #4CAF50;">
            <h3 style="color: #1B5E20; margin-top: 0;">${product.naam}</h3>
            <p>${product.beschrijving}</p>
            ${prijzenHTML}
        </div>
    `;
}

// Automatisch alle producten tonen bij laden
window.onload = function() {
    console.log("🎉 Website geladen! Alles werkt!");
}