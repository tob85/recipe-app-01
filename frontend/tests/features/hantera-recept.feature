Feature: Hantera recept
  Som användare
  vill jag kunna spara och visa recept
  så att jag enkelt kan samla och använda mina favoritrecept

  Scenario: Visa lista med sparade recept
    Given att användaren är på receptsidan
    And att följande recept finns sparade:
      | namn                      | url                            | typ     |
      | Köttbullar med potatismos | https://example.com/kottbullar | externt |
      | Mormors äppelpaj          |                                | eget    |
    When sidan laddas
    Then ska en lista med alla sparade recept visas
    And endast receptens namn ska visas
    And hela receptets innehåll ska inte visas

  Scenario: Visa knapp för att lägga till nytt recept
    Given att användaren är på receptsidan
    When sidan visas
    Then ska det finnas en knapp för att lägga till ett nytt recept

  Scenario: Öppna dialog för att lägga till recept
    Given att användaren är på receptsidan
    When användaren klickar på "Lägg till recept"
    Then ska en dialog öppnas
    And dialogen ska innehålla ett fält för receptnamn
    And dialogen ska innehålla ett avsnitt för URL
    And dialogen ska innehålla ett avsnitt för ingredienser och instruktioner
    And dialogen ska innehålla ett avsnitt för kategorier
    And dialogen ska innehålla en knapp för att spara receptet

  Scenario: Spara recept med URL
    Given att användaren har öppnat dialogen för att lägga till recept
    When användaren anger ett receptnamn "Pannkakor"
    And användaren anger en URL "https://example.com/pannkakor"
    And användaren klickar på "Spara"
    Then ska receptet sparas
    And receptet ska visas i receptlistan
    And receptet ska vara markerat som ett externt recept

  Scenario: Spara eget recept
    Given att användaren har öppnat dialogen för att lägga till recept
    When användaren anger ett receptnamn "Chokladkaka"
    And användaren anger ingredienser "mjöl, socker, kakao"
    And användaren anger instruktioner "Blanda och grädda"
    And användaren klickar på "Spara"
    Then ska receptet sparas
    And receptet ska visas i receptlistan

  Scenario: Spara recept med kategorier
    Given att användaren har öppnat dialogen för att lägga till recept
    When användaren anger ett receptnamn "Pannkakor"
    And användaren anger en URL "https://example.com/pannkakor"
    And användaren lägger till kategorin "Frukost"
    And användaren klickar på "Spara"
    Then ska receptet sparas
    And receptet ska visas i receptlistan med kategorin "Frukost"

  Scenario: Lägg till kategori från receptlistan
    Given att användaren är på receptsidan
    And att följande recept finns sparade:
      | namn      | url                           | typ     |
      | Pannkakor | https://example.com/pannkakor | externt |
    When sidan laddas
    And användaren lägger till kategorin "Frukost" på receptet "Pannkakor"
    Then ska receptet "Pannkakor" visa kategorin "Frukost"

  Scenario: Lägg till extra anteckning från receptlistan
    Given att användaren är på receptsidan
    And att följande recept finns sparade:
      | namn      | url                           | typ     |
      | Pannkakor | https://example.com/pannkakor | externt |
    When sidan laddas
    And användaren anger extra anteckning "Ta extra vitlök" på receptet "Pannkakor"
    And användaren sparar extra anteckningen för receptet "Pannkakor"
    Then ska receptet "Pannkakor" ha extra anteckningen "Ta extra vitlök"

  Scenario: Receptnamn är obligatoriskt
    Given att användaren har öppnat dialogen för att lägga till recept
    When användaren inte anger något receptnamn
    And användaren anger ingredienser "mjöl"
    And användaren anger instruktioner "Blanda"
    And användaren klickar på "Spara"
    Then ska receptet inte sparas
    And användaren ska få ett felmeddelande om att receptnamn måste anges

  Scenario: Receptinnehåll är obligatoriskt
    Given att användaren har öppnat dialogen för att lägga till recept
    When användaren anger ett receptnamn "Tomt recept"
    And användaren klickar på "Spara"
    Then ska receptet inte sparas
    And användaren ska få ett felmeddelande om att receptinnehåll måste anges

  Scenario: Dialogen visar hjälptext
    Given att användaren har öppnat dialogen för att lägga till recept
    Then ska dialogen visa hjälptext om hur man lägger till recept

  Scenario: Öppna recept med URL i ny flik
    Given att användaren är på receptsidan
    And att följande recept finns sparade:
      | namn      | url                            | typ     |
      | Pannkakor | https://example.com/pannkakor  | externt |
    When sidan laddas
    And användaren klickar på receptets namn "Pannkakor"
    Then ska receptets URL öppnas i en ny flik

  Scenario: Öppna eget recept utan URL
    Given att användaren är på receptsidan
    And att följande recept finns sparade:
      | namn           | url | typ  |
      | Chokladkaka    |     | eget |
    When sidan laddas
    And användaren klickar på receptets namn "Chokladkaka"
    Then ska användaren skickas till en sida där det egna receptet visas
