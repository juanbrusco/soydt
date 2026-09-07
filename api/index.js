// server/app.ts
import express from "express";
import dotenv from "dotenv";

// server/db.ts
import { neon } from "@neondatabase/serverless";

// src/data/players.ts
var PLAYERS_DB = [
  // ================= DELANTEROS CENTRO (DC) =================
  { id: "231747", name: "K. Mbapp\xE9", ovr: 94, primaryPosition: "DC", position: "DC", club: "Real Madrid", emoji: "\u26BD", country: "\u{1F1EB}\u{1F1F7}", nationality: "Francia" },
  { id: "231443", name: "O. Demb\xE9l\xE9", ovr: 90, primaryPosition: "DC", position: "DC", club: "Paris Saint-Germain", emoji: "\u26BD", country: "\u{1F1EB}\u{1F1F7}", nationality: "Francia" },
  { id: "239085", name: "E. Haaland", ovr: 92, primaryPosition: "DC", position: "DC", club: "Manchester City", emoji: "\u26BD", country: "\u{1F1F3}\u{1F1F4}", nationality: "Noruega" },
  { id: "202126", name: "H. Kane", ovr: 89, primaryPosition: "DC", position: "DC", club: "FC Bayern M\xFCnchen", emoji: "\u26BD", country: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}", nationality: "Inglaterra" },
  { id: "231478", name: "L. Mart\xEDnez", ovr: 88, primaryPosition: "DC", position: "DC", club: "Inter", emoji: "\u26BD", country: "\u{1F1E6}\u{1F1F7}", nationality: "Argentina" },
  { id: "188545", name: "R. Lewandowski", ovr: 88, primaryPosition: "DC", position: "DC", club: "FC Barcelona", emoji: "\u26BD", country: "\u{1F1F5}\u{1F1F1}", nationality: "Polonia" },
  { id: "233731", name: "A. Isak", ovr: 89, primaryPosition: "DC", position: "DC", club: "Liverpool", emoji: "\u26BD", country: "\u{1F1F8}\u{1F1EA}", nationality: "Suecia" },
  { id: "246191", name: "J. Alvarez", ovr: 90, primaryPosition: "DC", position: "DC", club: "Atl\xE9tico Madrid", emoji: "\u26BD", country: "\u{1F1E6}\u{1F1F7}", nationality: "Argentina" },
  { id: "215441", name: "S. Guirassy", ovr: 87, primaryPosition: "DC", position: "DC", club: "Borussia Dortmund", emoji: "\u26BD", country: "\u{1F1EC}\u{1F1F3}", nationality: "Guinea" },
  { id: "241651", name: "V. Gy\xF6keres", ovr: 88, primaryPosition: "DC", position: "DC", club: "Arsenal", emoji: "\u26BD", country: "\u{1F1F8}\u{1F1EA}", nationality: "Suecia" },
  { id: "232293", name: "V. Osimhen", ovr: 89, primaryPosition: "DC", position: "DC", club: "Galatasaray SK", emoji: "\u26BD", country: "\u{1F1F3}\u{1F1EC}", nationality: "Nigeria" },
  { id: "194765", name: "A. Griezmann", ovr: 85, primaryPosition: "DC", position: "DC", club: "Atl\xE9tico Madrid", emoji: "\u26BD", country: "\u{1F1EB}\u{1F1F7}", nationality: "Francia" },
  { id: "228093", name: "M. Thuram", ovr: 85, primaryPosition: "DC", position: "DC", club: "Inter", emoji: "\u26BD", country: "\u{1F1EB}\u{1F1F7}", nationality: "Francia" },
  { id: "20801", name: "Cristiano Ronaldo", ovr: 85, primaryPosition: "DC", position: "DC", club: "Al Nassr", emoji: "\u26BD", country: "\u{1F1F5}\u{1F1F9}", nationality: "Portugal" },
  { id: "165153", name: "K. Benzema", ovr: 85, primaryPosition: "DC", position: "DC", club: "Al Ittihad", emoji: "\u26BD", country: "\u{1F1EB}\u{1F1F7}", nationality: "Francia" },
  { id: "234236", name: "P. Schick", ovr: 85, primaryPosition: "DC", position: "DC", club: "Bayer 04 Leverkusen", emoji: "\u26BD", country: "\u{1F1E8}\u{1F1FF}", nationality: "Rep\xFAblica Checa" },
  { id: "221697", name: "O. Watkins", ovr: 84, primaryPosition: "DC", position: "DC", club: "Aston Villa", emoji: "\u26BD", country: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}", nationality: "Inglaterra" },
  { id: "256675", name: "O. Marmoush", ovr: 85, primaryPosition: "DC", position: "DC", club: "Manchester City", emoji: "\u26BD", country: "\u{1F1EA}\u{1F1EC}", nationality: "Egipto" },
  { id: "192505", name: "R. Lukaku", ovr: 84, primaryPosition: "DC", position: "DC", club: "Napoli", emoji: "\u26BD", country: "\u{1F1E7}\u{1F1EA}", nationality: "B\xE9lgica" },
  { id: "230899", name: "A. Lookman", ovr: 84, primaryPosition: "DC", position: "DC", club: "Atalanta", emoji: "\u26BD", country: "\u{1F1F3}\u{1F1EC}", nationality: "Nigeria" },
  { id: "216549", name: "A. S\xF8rloth", ovr: 84, primaryPosition: "DC", position: "DC", club: "Atl\xE9tico Madrid", emoji: "\u26BD", country: "\u{1F1F3}\u{1F1F4}", nationality: "Noruega" },
  { id: "215590", name: "Ayoze", ovr: 83, primaryPosition: "DC", position: "DC", club: "Villarreal CF", emoji: "\u26BD", country: "\u{1F1EA}\u{1F1F8}", nationality: "Espa\xF1a" },
  // ================= EXTREMOS IZQUIERDOS (EI) =================
  { id: "238794", name: "Vini Jr.", ovr: 92, primaryPosition: "EI", position: "EI", club: "Real Madrid", emoji: "\u26BD", country: "\u{1F1E7}\u{1F1F7}", nationality: "Brasil" },
  { id: "247635", name: "K. Kvaratskhelia", ovr: 90, primaryPosition: "EI", position: "EI", club: "Paris Saint-Germain", emoji: "\u26BD", country: "\u{1F1EC}\u{1F1EA}", nationality: "Georgia" },
  { id: "256516", name: "Nico Williams", ovr: 89, primaryPosition: "EI", position: "EI", club: "Athletic Club", emoji: "\u26BD", country: "\u{1F1EA}\u{1F1F8}", nationality: "Espa\xF1a" },
  { id: "200104", name: "H. Son", ovr: 85, primaryPosition: "EI", position: "EI", club: "Los Angeles FC", emoji: "\u26BD", country: "\u{1F1F0}\u{1F1F7}", nationality: "Corea del Sur" },
  { id: "241084", name: "L. D\xEDaz", ovr: 85, primaryPosition: "EI", position: "EI", club: "FC Bayern M\xFCnchen", emoji: "\u26BD", country: "\u{1F1E8}\u{1F1F4}", nationality: "Colombia" },
  { id: "210035_ei", name: "Grimaldo", ovr: 84, primaryPosition: "EI", position: "EI", club: "Bayer 04 Leverkusen", emoji: "\u26BD", country: "\u{1F1EA}\u{1F1F8}", nationality: "Espa\xF1a" },
  { id: "257279", name: "\xC1lex Baena", ovr: 89, primaryPosition: "EI", position: "EI", club: "Atl\xE9tico Madrid", emoji: "\u26BD", country: "\u{1F1EA}\u{1F1F8}", nationality: "Espa\xF1a" },
  { id: "220502", name: "M. Zaccagni", ovr: 84, primaryPosition: "EI", position: "EI", club: "Lazio", emoji: "\u26BD", country: "\u{1F1EE}\u{1F1F9}", nationality: "Italia" },
  { id: "242516", name: "C. Gakpo", ovr: 85, primaryPosition: "EI", position: "EI", club: "Liverpool", emoji: "\u26BD", country: "\u{1F1F3}\u{1F1F1}", nationality: "Pa\xEDses Bajos" },
  { id: "241721", name: "Rafael Le\xE3o", ovr: 85, primaryPosition: "EI", position: "EI", club: "AC Milan", emoji: "\u26BD", country: "\u{1F1F5}\u{1F1F9}", nationality: "Portugal" },
  { id: "264652", name: "B. Barcola", ovr: 88, primaryPosition: "EI", position: "EI", club: "Paris Saint-Germain", emoji: "\u26BD", country: "\u{1F1EB}\u{1F1F7}", nationality: "Francia" },
  { id: "208722", name: "S. Man\xE9", ovr: 83, primaryPosition: "EI", position: "EI", club: "Al Nassr", emoji: "\u26BD", country: "\u{1F1F8}\u{1F1F3}", nationality: "Senegal" },
  { id: "242964", name: "A. Gordon", ovr: 86, primaryPosition: "EI", position: "EI", club: "Newcastle United", emoji: "\u26BD", country: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}", nationality: "Inglaterra" },
  { id: "241461", name: "Ferran Torres", ovr: 86, primaryPosition: "EI", position: "EI", club: "FC Barcelona", emoji: "\u26BD", country: "\u{1F1EA}\u{1F1F8}", nationality: "Espa\xF1a" },
  { id: "207421", name: "L. Trossard", ovr: 83, primaryPosition: "EI", position: "EI", club: "Arsenal", emoji: "\u26BD", country: "\u{1F1E7}\u{1F1EA}", nationality: "B\xE9lgica" },
  { id: "213345", name: "K. Coman", ovr: 83, primaryPosition: "EI", position: "EI", club: "Al Nassr", emoji: "\u26BD", country: "\u{1F1EB}\u{1F1F7}", nationality: "Francia" },
  { id: "225201", name: "Berenguer", ovr: 82, primaryPosition: "EI", position: "EI", club: "Athletic Club", emoji: "\u26BD", country: "\u{1F1EA}\u{1F1F8}", nationality: "Espa\xF1a" },
  { id: "210602", name: "S. Al Dawsari", ovr: 82, primaryPosition: "EI", position: "EI", club: "Al Hilal", emoji: "\u26BD", country: "\u{1F1F8}\u{1F1E6}", nationality: "Arabia Saudita" },
  { id: "255565", name: "K. Mitoma", ovr: 82, primaryPosition: "EI", position: "EI", club: "Brighton & Hove Albion", emoji: "\u26BD", country: "\u{1F1EF}\u{1F1F5}", nationality: "Jap\xF3n" },
  { id: "208574", name: "F. Kosti\u0107", ovr: 81, primaryPosition: "EI", position: "EI", club: "Juventus", emoji: "\u26BD", country: "\u{1F1F7}\u{1F1F8}", nationality: "Serbia" },
  { id: "202648", name: "Sergi Darder", ovr: 81, primaryPosition: "EI", position: "EI", club: "RCD Mallorca", emoji: "\u26BD", country: "\u{1F1EA}\u{1F1F8}", nationality: "Espa\xF1a" },
  { id: "208418", name: "Y. Carrasco", ovr: 81, primaryPosition: "EI", position: "EI", club: "Al Shabab", emoji: "\u26BD", country: "\u{1F1E7}\u{1F1EA}", nationality: "B\xE9lgica" },
  { id: "251566", name: "Gabriel Martinelli", ovr: 84, primaryPosition: "EI", position: "EI", club: "Arsenal", emoji: "\u26BD", country: "\u{1F1E7}\u{1F1F7}", nationality: "Brasil" },
  { id: "239482", name: "Galeno", ovr: 81, primaryPosition: "EI", position: "EI", club: "Al Ahli SFC", emoji: "\u26BD", country: "\u{1F1E7}\u{1F1F7}", nationality: "Brasil" },
  { id: "236632", name: "David Neres", ovr: 81, primaryPosition: "EI", position: "EI", club: "Napoli", emoji: "\u26BD", country: "\u{1F1E7}\u{1F1F7}", nationality: "Brasil" },
  { id: "263205", name: "B. Y\u0131lmaz", ovr: 83, primaryPosition: "EI", position: "EI", club: "Galatasaray SK", emoji: "\u26BD", country: "\u{1F1F9}\u{1F1F7}", nationality: "Turqu\xEDa" },
  { id: "213655", name: "A. Iwobi", ovr: 80, primaryPosition: "EI", position: "EI", club: "Fulham FC", emoji: "\u26BD", country: "\u{1F1F3}\u{1F1EC}", nationality: "Nigeria" },
  { id: "206517", name: "J. Grealish", ovr: 80, primaryPosition: "EI", position: "EI", club: "Everton", emoji: "\u26BD", country: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}", nationality: "Inglaterra" },
  // ================= EXTREMOS DERECHOS (ED) =================
  { id: "209331", name: "M. Salah", ovr: 91, primaryPosition: "ED", position: "ED", club: "Liverpool", emoji: "\u26BD", country: "\u{1F1EA}\u{1F1EC}", nationality: "Egipto" },
  { id: "277643", name: "Lamine Yamal", ovr: 95, primaryPosition: "ED", position: "ED", club: "FC Barcelona", emoji: "\u26BD", country: "\u{1F1EA}\u{1F1F8}", nationality: "Espa\xF1a" },
  { id: "246669", name: "B. Saka", ovr: 90, primaryPosition: "ED", position: "ED", club: "Arsenal", emoji: "\u26BD", country: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}", nationality: "Inglaterra" },
  { id: "247827", name: "M. Olise", ovr: 88, primaryPosition: "ED", position: "ED", club: "FC Bayern M\xFCnchen", emoji: "\u26BD", country: "\u{1F1EB}\u{1F1F7}", nationality: "Francia" },
  { id: "158023", name: "L. Messi", ovr: 86, primaryPosition: "ED", position: "ED", club: "Inter Miami", emoji: "\u26BD", country: "\u{1F1E6}\u{1F1F7}", nationality: "Argentina" },
  { id: "243014", name: "B. Mbeumo", ovr: 86, primaryPosition: "ED", position: "ED", club: "Manchester United", emoji: "\u26BD", country: "\u{1F1E8}\u{1F1F2}", nationality: "Camer\xFAn" },
  { id: "271421", name: "D. Dou\xE9", ovr: 91, primaryPosition: "ED", position: "ED", club: "Paris Saint-Germain", emoji: "\u26BD", country: "\u{1F1EB}\u{1F1F7}", nationality: "Francia" },
  { id: "237692", name: "P. Foden", ovr: 88, primaryPosition: "ED", position: "ED", club: "Manchester City", emoji: "\u26BD", country: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}", nationality: "Inglaterra" },
  { id: "243812", name: "Rodrygo", ovr: 90, primaryPosition: "ED", position: "ED", club: "Real Madrid", emoji: "\u26BD", country: "\u{1F1E7}\u{1F1F7}", nationality: "Brasil" },
  { id: "227796", name: "C. Pulisic", ovr: 84, primaryPosition: "ED", position: "ED", club: "AC Milan", emoji: "\u26BD", country: "\u{1F1FA}\u{1F1F8}", nationality: "Estados Unidos" },
  { id: "204485", name: "R. Mahrez", ovr: 84, primaryPosition: "ED", position: "ED", club: "Al Ahli SFC", emoji: "\u26BD", country: "\u{1F1E9}\u{1F1FF}", nationality: "Argelia" },
  { id: "241852", name: "M. Diaby", ovr: 85, primaryPosition: "ED", position: "ED", club: "Al Ittihad", emoji: "\u26BD", country: "\u{1F1EB}\u{1F1F7}", nationality: "Francia" },
  { id: "216201", name: "I\xF1aki Williams", ovr: 83, primaryPosition: "ED", position: "ED", club: "Athletic Club", emoji: "\u26BD", country: "\u{1F1EC}\u{1F1ED}", nationality: "Ghana" },
  { id: "224371", name: "J. Bowen", ovr: 83, primaryPosition: "ED", position: "ED", club: "West Ham United", emoji: "\u26BD", country: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}", nationality: "Inglaterra" },
  { id: "192629", name: "Iago Aspas", ovr: 83, primaryPosition: "ED", position: "ED", club: "RC Celta", emoji: "\u26BD", country: "\u{1F1EA}\u{1F1F8}", nationality: "Espa\xF1a" },
  { id: "233556", name: "R. Orsolini", ovr: 82, primaryPosition: "ED", position: "ED", club: "Bologna", emoji: "\u26BD", country: "\u{1F1EE}\u{1F1F9}", nationality: "Italia" },
  { id: "222492", name: "L. San\xE9", ovr: 82, primaryPosition: "ED", position: "ED", club: "Galatasaray SK", emoji: "\u26BD", country: "\u{1F1E9}\u{1F1EA}", nationality: "Alemania" },
  { id: "183898", name: "\xC1. Di Mar\xEDa", ovr: 82, primaryPosition: "ED", position: "ED", club: "Rosario Central", emoji: "\u26BD", country: "\u{1F1E6}\u{1F1F7}", nationality: "Argentina" },
  { id: "210935", name: "D. Berardi", ovr: 82, primaryPosition: "ED", position: "ED", club: "Sassuolo", emoji: "\u26BD", country: "\u{1F1EE}\u{1F1F9}", nationality: "Italia" },
  { id: "246147", name: "M. Greenwood", ovr: 86, primaryPosition: "ED", position: "ED", club: "Olympique de Marseille", emoji: "\u26BD", country: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}", nationality: "Inglaterra" },
  { id: "237681", name: "T. Kubo", ovr: 86, primaryPosition: "ED", position: "ED", club: "Real Sociedad", emoji: "\u26BD", country: "\u{1F1EF}\u{1F1F5}", nationality: "Jap\xF3n" },
  { id: "231416", name: "D. Luk\xE9bakio", ovr: 82, primaryPosition: "ED", position: "ED", club: "SL Benfica", emoji: "\u26BD", country: "\u{1F1E7}\u{1F1EA}", nationality: "B\xE9lgica" },
  { id: "231410", name: "Brahim", ovr: 83, primaryPosition: "ED", position: "ED", club: "Real Madrid", emoji: "\u26BD", country: "\u{1F1F2}\u{1F1E6}", nationality: "Marruecos" },
  { id: "270409", name: "Savinho", ovr: 87, primaryPosition: "ED", position: "ED", club: "Manchester City", emoji: "\u26BD", country: "\u{1F1E7}\u{1F1F7}", nationality: "Brasil" },
  { id: "181458", name: "I. Peri\u0161i\u0107", ovr: 81, primaryPosition: "ED", position: "ED", club: "PSV", emoji: "\u26BD", country: "\u{1F1ED}\u{1F1F7}", nationality: "Croacia" },
  { id: "216409", name: "M. Politano", ovr: 81, primaryPosition: "ED", position: "ED", club: "Napoli", emoji: "\u26BD", country: "\u{1F1EE}\u{1F1F9}", nationality: "Italia" },
  { id: "206085", name: "J. Murphy", ovr: 81, primaryPosition: "ED", position: "ED", club: "Newcastle United", emoji: "\u26BD", country: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}", nationality: "Inglaterra" },
  { id: "255475", name: "Antony", ovr: 84, primaryPosition: "ED", position: "ED", club: "Real Betis Balompi\xE9", emoji: "\u26BD", country: "\u{1F1E7}\u{1F1F7}", nationality: "Brasil" },
  { id: "235805", name: "F. Chiesa", ovr: 81, primaryPosition: "ED", position: "ED", club: "Liverpool", emoji: "\u26BD", country: "\u{1F1EE}\u{1F1F9}", nationality: "Italia" },
  { id: "253396", name: "G. Simeone", ovr: 86, primaryPosition: "ED", position: "ED", club: "Atl\xE9tico Madrid", emoji: "\u26BD", country: "\u{1F1E6}\u{1F1F7}", nationality: "Argentina" },
  // ================= MEDIOCAMPISTAS (MC) =================
  { id: "231866", name: "Rodri", ovr: 90, primaryPosition: "MC", position: "MC", club: "Manchester City", emoji: "\u2699\uFE0F", country: "\u{1F1EA}\u{1F1F8}", nationality: "Espa\xF1a" },
  { id: "251854", name: "Pedri", ovr: 93, primaryPosition: "MC", position: "MC", club: "FC Barcelona", emoji: "\u2699\uFE0F", country: "\u{1F1EA}\u{1F1F8}", nationality: "Espa\xF1a" },
  { id: "255253", name: "Vitinha", ovr: 91, primaryPosition: "MC", position: "MC", club: "Paris Saint-Germain", emoji: "\u2699\uFE0F", country: "\u{1F1F5}\u{1F1F9}", nationality: "Portugal" },
  { id: "239053_mc", name: "F. Valverde", ovr: 90, primaryPosition: "MC", position: "MC", club: "Real Madrid", emoji: "\u2699\uFE0F", country: "\u{1F1FA}\u{1F1FE}", nationality: "Uruguay" },
  { id: "212622_mc", name: "J. Kimmich", ovr: 89, primaryPosition: "MC", position: "MC", club: "FC Bayern M\xFCnchen", emoji: "\u2699\uFE0F", country: "\u{1F1E9}\u{1F1EA}", nationality: "Alemania" },
  { id: "256079", name: "M. Caicedo", ovr: 89, primaryPosition: "MC", position: "MC", club: "Chelsea", emoji: "\u2699\uFE0F", country: "\u{1F1EA}\u{1F1E8}", nationality: "Ecuador" },
  { id: "239837", name: "A. Mac Allister", ovr: 88, primaryPosition: "MC", position: "MC", club: "Liverpool", emoji: "\u2699\uFE0F", country: "\u{1F1E6}\u{1F1F7}", nationality: "Argentina" },
  { id: "234378", name: "D. Rice", ovr: 88, primaryPosition: "MC", position: "MC", club: "Arsenal", emoji: "\u2699\uFE0F", country: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}", nationality: "Inglaterra" },
  { id: "228702", name: "F. de Jong", ovr: 87, primaryPosition: "MC", position: "MC", club: "FC Barcelona", emoji: "\u2699\uFE0F", country: "\u{1F1F3}\u{1F1F1}", nationality: "Pa\xEDses Bajos" },
  { id: "241096", name: "S. Tonali", ovr: 88, primaryPosition: "MC", position: "MC", club: "Newcastle United", emoji: "\u2699\uFE0F", country: "\u{1F1EE}\u{1F1F9}", nationality: "Italia" },
  { id: "240638", name: "T. Reijnders", ovr: 87, primaryPosition: "MC", position: "MC", club: "Manchester City", emoji: "\u2699\uFE0F", country: "\u{1F1F3}\u{1F1F1}", nationality: "Pa\xEDses Bajos" },
  { id: "247851", name: "Bruno Guimar\xE3es", ovr: 87, primaryPosition: "MC", position: "MC", club: "Newcastle United", emoji: "\u2699\uFE0F", country: "\u{1F1E7}\u{1F1F7}", nationality: "Brasil" },
  { id: "208128", name: "H. \xC7alhano\u011Flu", ovr: 86, primaryPosition: "MC", position: "MC", club: "Inter", emoji: "\u2699\uFE0F", country: "\u{1F1F9}\u{1F1F7}", nationality: "Turqu\xEDa" },
  { id: "272834", name: "Jo\xE3o Neves", ovr: 90, primaryPosition: "MC", position: "MC", club: "Paris Saint-Germain", emoji: "\u2699\uFE0F", country: "\u{1F1F5}\u{1F1F9}", nationality: "Portugal" },
  { id: "246104", name: "R. Gravenberch", ovr: 88, primaryPosition: "MC", position: "MC", club: "Liverpool", emoji: "\u2699\uFE0F", country: "\u{1F1F3}\u{1F1F1}", nationality: "Pa\xEDses Bajos" },
  { id: "216393", name: "Y. Tielemans", ovr: 85, primaryPosition: "MC", position: "MC", club: "Aston Villa", emoji: "\u2699\uFE0F", country: "\u{1F1E7}\u{1F1EA}", nationality: "B\xE9lgica" },
  { id: "226271", name: "Fabi\xE1n Ruiz", ovr: 85, primaryPosition: "MC", position: "MC", club: "Paris Saint-Germain", emoji: "\u2699\uFE0F", country: "\u{1F1EA}\u{1F1F8}", nationality: "Espa\xF1a" },
  { id: "199503", name: "G. Xhaka", ovr: 85, primaryPosition: "MC", position: "MC", club: "Sunderland", emoji: "\u2699\uFE0F", country: "\u{1F1E8}\u{1F1ED}", nationality: "Suiza" },
  { id: "215914", name: "N. Kant\xE9", ovr: 85, primaryPosition: "MC", position: "MC", club: "Al Ittihad", emoji: "\u2699\uFE0F", country: "\u{1F1EB}\u{1F1F7}", nationality: "Francia" },
  { id: "247090", name: "E. Fern\xE1ndez", ovr: 87, primaryPosition: "MC", position: "MC", club: "Chelsea", emoji: "\u2699\uFE0F", country: "\u{1F1E6}\u{1F1F7}", nationality: "Argentina" },
  { id: "241637_mc", name: "A. Tchouam\xE9ni", ovr: 87, primaryPosition: "MC", position: "MC", club: "Real Madrid", emoji: "\u2699\uFE0F", country: "\u{1F1EB}\u{1F1F7}", nationality: "Francia" },
  { id: "231521", name: "E. Palacios", ovr: 86, primaryPosition: "MC", position: "MC", club: "Bayer 04 Leverkusen", emoji: "\u2699\uFE0F", country: "\u{1F1E6}\u{1F1F7}", nationality: "Argentina" },
  { id: "224293", name: "R\xFAben Neves", ovr: 85, primaryPosition: "MC", position: "MC", club: "Al Hilal", emoji: "\u2699\uFE0F", country: "\u{1F1F5}\u{1F1F9}", nationality: "Portugal" },
  { id: "222077", name: "M. Locatelli", ovr: 85, primaryPosition: "MC", position: "MC", club: "Juventus", emoji: "\u2699\uFE0F", country: "\u{1F1EE}\u{1F1F9}", nationality: "Italia" },
  { id: "212616", name: "R. De Paul", ovr: 84, primaryPosition: "MC", position: "MC", club: "Inter Miami", emoji: "\u2699\uFE0F", country: "\u{1F1E6}\u{1F1F7}", nationality: "Argentina" },
  { id: "223848", name: "S. Milinkovi\u0107-Savi\u0107", ovr: 84, primaryPosition: "MC", position: "MC", club: "Al Hilal", emoji: "\u2699\uFE0F", country: "\u{1F1F7}\u{1F1F8}", nationality: "Serbia" },
  { id: "218667", name: "Bernardo Silva", ovr: 84, primaryPosition: "MC", position: "MC", club: "Manchester City", emoji: "\u2699\uFE0F", country: "\u{1F1F5}\u{1F1F9}", nationality: "Portugal" },
  { id: "248243_mc", name: "E. Camavinga", ovr: 90, primaryPosition: "MC", position: "MC", club: "Real Madrid", emoji: "\u2699\uFE0F", country: "\u{1F1EB}\u{1F1F7}", nationality: "Francia" },
  { id: "248148", name: "Zubimendi", ovr: 87, primaryPosition: "MC", position: "MC", club: "Arsenal", emoji: "\u2699\uFE0F", country: "\u{1F1EA}\u{1F1F8}", nationality: "Espa\xF1a" },
  { id: "250959", name: "A. Stiller", ovr: 87, primaryPosition: "MC", position: "MC", club: "VfB Stuttgart", emoji: "\u2699\uFE0F", country: "\u{1F1E9}\u{1F1EA}", nationality: "Alemania" },
  { id: "244669", name: "M. Hjulmand", ovr: 86, primaryPosition: "MC", position: "MC", club: "Sporting CP", emoji: "\u2699\uFE0F", country: "\u{1F1E9}\u{1F1F0}", nationality: "Dinamarca" },
  { id: "236987", name: "B. Kamara", ovr: 85, primaryPosition: "MC", position: "MC", club: "Aston Villa", emoji: "\u2699\uFE0F", country: "\u{1F1EB}\u{1F1F7}", nationality: "Francia" },
  { id: "223959", name: "L. Torreira", ovr: 83, primaryPosition: "MC", position: "MC", club: "Galatasaray SK", emoji: "\u2699\uFE0F", country: "\u{1F1FA}\u{1F1FE}", nationality: "Uruguay" },
  { id: "177003", name: "L. Modri\u0107", ovr: 83, primaryPosition: "MC", position: "MC", club: "AC Milan", emoji: "\u2699\uFE0F", country: "\u{1F1ED}\u{1F1F7}", nationality: "Croacia" },
  // ================= LATERALES DERECHOS (LD / _dfd) =================
  { id: "239053_ld", name: "F. Valverde", ovr: 90, primaryPosition: "LD", position: "LD", club: "Real Madrid", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1FA}\u{1F1FE}", nationality: "Uruguay" },
  { id: "235212", name: "A. Hakimi", ovr: 90, primaryPosition: "LD", position: "LD", club: "Paris Saint-Germain", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1F2}\u{1F1E6}", nationality: "Marruecos" },
  { id: "212622_ld", name: "J. Kimmich", ovr: 89, primaryPosition: "LD", position: "LD", club: "FC Bayern M\xFCnchen", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1E9}\u{1F1EA}", nationality: "Alemania" },
  { id: "241486_ld", name: "J. Kound\xE9", ovr: 88, primaryPosition: "LD", position: "LD", club: "FC Barcelona", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1EB}\u{1F1F7}", nationality: "Francia" },
  { id: "271266", name: "G. Read", ovr: 88, primaryPosition: "LD", position: "LD", club: "Feyenoord", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1F3}\u{1F1F1}", nationality: "Pa\xEDses Bajos" },
  { id: "231281", name: "T. Alexander-Arnold", ovr: 87, primaryPosition: "LD", position: "LD", club: "Real Madrid", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}", nationality: "Inglaterra" },
  { id: "253163", name: "R. Araujo", ovr: 86, primaryPosition: "LD", position: "LD", club: "FC Barcelona", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1FA}\u{1F1FE}", nationality: "Uruguay" },
  { id: "243854", name: "M. Simakan", ovr: 86, primaryPosition: "LD", position: "LD", club: "Al Nassr", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1EB}\u{1F1F7}", nationality: "Francia" },
  { id: "251479", name: "M. De Cuyper", ovr: 86, primaryPosition: "LD", position: "LD", club: "Brighton & Hove Albion", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1E7}\u{1F1EA}", nationality: "B\xE9lgica" },
  { id: "262118", name: "T. Livramento", ovr: 86, primaryPosition: "LD", position: "LD", club: "Newcastle United", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}", nationality: "Inglaterra" },
  { id: "266096", name: "Tom\xE1s Ara\xFAjo", ovr: 86, primaryPosition: "LD", position: "LD", club: "SL Benfica", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1F5}\u{1F1F9}", nationality: "Portugal" },
  { id: "75605", name: "Asencio", ovr: 86, primaryPosition: "LD", position: "LD", club: "Real Madrid", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1EA}\u{1F1F8}", nationality: "Espa\xF1a" },
  { id: "270208", name: "A. Gray", ovr: 86, primaryPosition: "LD", position: "LD", club: "Tottenham Hotspur", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}", nationality: "Inglaterra" },
  { id: "71305", name: "J. Seys", ovr: 86, primaryPosition: "LD", position: "LD", club: "Club Brugge KV", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1E7}\u{1F1EA}", nationality: "B\xE9lgica" },
  { id: "278567", name: "Jo\xE3o Costa", ovr: 86, primaryPosition: "LD", position: "LD", club: "Al Ettifaq", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1E7}\u{1F1F7}", nationality: "Brasil" },
  { id: "204963", name: "Carvajal", ovr: 85, primaryPosition: "LD", position: "LD", club: "Real Madrid", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1EA}\u{1F1F8}", nationality: "Espa\xF1a" },
  { id: "253149", name: "J. Frimpong", ovr: 85, primaryPosition: "LD", position: "LD", club: "Liverpool", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1F3}\u{1F1F1}", nationality: "Pa\xEDses Bajos" },
  { id: "243576", name: "Pedro Porro", ovr: 85, primaryPosition: "LD", position: "LD", club: "Tottenham Hotspur", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1EA}\u{1F1F8}", nationality: "Espa\xF1a" },
  // ================= DEFENSORES CENTRALES (DFC / _dfc) =================
  { id: "203376", name: "V. van Dijk", ovr: 90, primaryPosition: "DFC", position: "DFC", club: "Liverpool", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1F3}\u{1F1F1}", nationality: "Pa\xEDses Bajos" },
  { id: "232580", name: "Gabriel", ovr: 88, primaryPosition: "DFC", position: "DFC", club: "Arsenal", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1E7}\u{1F1F7}", nationality: "Brasil" },
  { id: "207865", name: "Marquinhos", ovr: 87, primaryPosition: "DFC", position: "DFC", club: "Paris Saint-Germain", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1E7}\u{1F1F7}", nationality: "Brasil" },
  { id: "241486_dfc", name: "J. Kound\xE9", ovr: 88, primaryPosition: "DFC", position: "DFC", club: "FC Barcelona", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1EB}\u{1F1F7}", nationality: "Francia" },
  { id: "237383", name: "A. Bastoni", ovr: 89, primaryPosition: "DFC", position: "DFC", club: "Inter", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1EE}\u{1F1F9}", nationality: "Italia" },
  { id: "243715", name: "W. Saliba", ovr: 89, primaryPosition: "DFC", position: "DFC", club: "Arsenal", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1EB}\u{1F1F7}", nationality: "Francia" },
  { id: "213331", name: "J. Tah", ovr: 87, primaryPosition: "DFC", position: "DFC", club: "FC Bayern M\xFCnchen", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1E9}\u{1F1EA}", nationality: "Alemania" },
  { id: "205452", name: "A. R\xFCdiger", ovr: 86, primaryPosition: "DFC", position: "DFC", club: "Real Madrid", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1E9}\u{1F1EA}", nationality: "Alemania" },
  { id: "239818", name: "R\xFAben Dias", ovr: 87, primaryPosition: "DFC", position: "DFC", club: "Manchester City", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1F5}\u{1F1F9}", nationality: "Portugal" },
  { id: "256196", name: "W. Pacho", ovr: 89, primaryPosition: "DFC", position: "DFC", club: "Paris Saint-Germain", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1EA}\u{1F1E8}", nationality: "Ecuador" },
  { id: "237678", name: "I. Konat\xE9", ovr: 87, primaryPosition: "DFC", position: "DFC", club: "Liverpool", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1EB}\u{1F1F7}", nationality: "Francia" },
  { id: "247819", name: "N. Schlotterbeck", ovr: 88, primaryPosition: "DFC", position: "DFC", club: "Borussia Dortmund", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1E9}\u{1F1EA}", nationality: "Alemania" },
  { id: "204525", name: "I\xF1igo Mart\xEDnez", ovr: 85, primaryPosition: "DFC", position: "DFC", club: "Al Nassr", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1EA}\u{1F1F8}", nationality: "Espa\xF1a" },
  { id: "229558", name: "D. Upamecano", ovr: 88, primaryPosition: "DFC", position: "DFC", club: "FC Bayern M\xFCnchen", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1EB}\u{1F1F7}", nationality: "Francia" },
  { id: "239580", name: "Bremer", ovr: 86, primaryPosition: "DFC", position: "DFC", club: "Juventus", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1E7}\u{1F1F7}", nationality: "Brasil" },
  { id: "251517_dfc", name: "J. Gvardiol", ovr: 87, primaryPosition: "DFC", position: "DFC", club: "Manchester City", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1ED}\u{1F1F7}", nationality: "Croacia" },
  { id: "226851", name: "B. Pavard", ovr: 84, primaryPosition: "DFC", position: "DFC", club: "Olympique de Marseille", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1EB}\u{1F1F7}", nationality: "Francia" },
  { id: "241637_dfc", name: "A. Tchouam\xE9ni", ovr: 87, primaryPosition: "DFC", position: "DFC", club: "Real Madrid", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1EB}\u{1F1F7}", nationality: "Francia" },
  { id: "240130", name: "\xC9der Milit\xE3o", ovr: 87, primaryPosition: "DFC", position: "DFC", club: "Real Madrid", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1E7}\u{1F1F7}", nationality: "Brasil" },
  { id: "248550", name: "Vivian", ovr: 87, primaryPosition: "DFC", position: "DFC", club: "Athletic Club", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1EA}\u{1F1F8}", nationality: "Espa\xF1a" },
  { id: "199845", name: "F. Acerbi", ovr: 84, primaryPosition: "DFC", position: "DFC", club: "Inter", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1EE}\u{1F1F9}", nationality: "Italia" },
  { id: "198176", name: "S. de Vrij", ovr: 84, primaryPosition: "DFC", position: "DFC", club: "Inter", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1F3}\u{1F1F1}", nationality: "Pa\xEDses Bajos" },
  { id: "204638", name: "W. Orban", ovr: 84, primaryPosition: "DFC", position: "DFC", club: "RB Leipzig", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1ED}\u{1F1FA}", nationality: "Hungr\xEDa" },
  { id: "217870", name: "G. Di Lorenzo", ovr: 83, primaryPosition: "DFC", position: "DFC", club: "Napoli", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1EE}\u{1F1F9}", nationality: "Italia" },
  { id: "247103_dfc", name: "D. Hancko", ovr: 85, primaryPosition: "DFC", position: "DFC", club: "Atl\xE9tico Madrid", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1F8}\u{1F1F0}", nationality: "Eslovaquia" },
  { id: "208920_dfc", name: "N. Ak\xE9", ovr: 83, primaryPosition: "DFC", position: "DFC", club: "Manchester City", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1F3}\u{1F1F1}", nationality: "Pa\xEDses Bajos" },
  { id: "278016", name: "Murillo", ovr: 87, primaryPosition: "DFC", position: "DFC", club: "Nottingham Forest", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1E7}\u{1F1F7}", nationality: "Brasil" },
  { id: "256197_dfc", name: "P. Hincapi\xE9", ovr: 89, primaryPosition: "DFC", position: "DFC", club: "Arsenal", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1EA}\u{1F1E8}", nationality: "Ecuador" },
  // ================= LATERALES IZQUIERDOS (LI / _dfi) =================
  { id: "252145", name: "Nuno Mendes", ovr: 89, primaryPosition: "LI", position: "LI", club: "Paris Saint-Germain", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1F5}\u{1F1F9}", nationality: "Portugal" },
  { id: "226268", name: "F. Dimarco", ovr: 85, primaryPosition: "LI", position: "LI", club: "Inter", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1EE}\u{1F1F9}", nationality: "Italia" },
  { id: "232656", name: "T. Hern\xE1ndez", ovr: 85, primaryPosition: "LI", position: "LI", club: "Al Hilal", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1EB}\u{1F1F7}", nationality: "Francia" },
  { id: "210514", name: "Jo\xE3o Cancelo", ovr: 84, primaryPosition: "LI", position: "LI", club: "Al Hilal", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1F5}\u{1F1F9}", nationality: "Portugal" },
  { id: "210035_li", name: "Grimaldo", ovr: 84, primaryPosition: "LI", position: "LI", club: "Bayer 04 Leverkusen", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1EA}\u{1F1F8}", nationality: "Espa\xF1a" },
  { id: "239231", name: "Marc Cucurella", ovr: 85, primaryPosition: "LI", position: "LI", club: "Chelsea", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1EA}\u{1F1F8}", nationality: "Espa\xF1a" },
  { id: "234396", name: "A. Davies", ovr: 87, primaryPosition: "LI", position: "LI", club: "FC Bayern M\xFCnchen", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1E8}\u{1F1E6}", nationality: "Canad\xE1" },
  { id: "251517", name: "J. Gvardiol", ovr: 87, primaryPosition: "LI", position: "LI", club: "Manchester City", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1ED}\u{1F1F7}", nationality: "Croacia" },
  { id: "248243_li", name: "E. Camavinga", ovr: 90, primaryPosition: "LI", position: "LI", club: "Real Madrid", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1EB}\u{1F1F7}", nationality: "Francia" },
  { id: "247103", name: "D. Hancko", ovr: 85, primaryPosition: "LI", position: "LI", club: "Atl\xE9tico Madrid", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1F8}\u{1F1F0}", nationality: "Eslovaquia" },
  { id: "208920", name: "N. Ak\xE9", ovr: 83, primaryPosition: "LI", position: "LI", club: "Manchester City", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1F3}\u{1F1F1}", nationality: "Pa\xEDses Bajos" },
  { id: "263578", name: "Balde", ovr: 87, primaryPosition: "LI", position: "LI", club: "FC Barcelona", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1EA}\u{1F1F8}", nationality: "Espa\xF1a" },
  { id: "256197", name: "P. Hincapi\xE9", ovr: 89, primaryPosition: "LI", position: "LI", club: "Arsenal", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1EA}\u{1F1E8}", nationality: "Ecuador" },
  { id: "197445", name: "D. Alaba", ovr: 82, primaryPosition: "LI", position: "LI", club: "Real Madrid", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1E6}\u{1F1F9}", nationality: "Austria" },
  { id: "236703", name: "D. Raum", ovr: 83, primaryPosition: "LI", position: "LI", club: "RB Leipzig", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1E9}\u{1F1EA}", nationality: "Alemania" },
  { id: "260908", name: "M. Kerkez", ovr: 86, primaryPosition: "LI", position: "LI", club: "Liverpool", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F1ED}\u{1F1FA}", nationality: "Hungr\xEDa" },
  { id: "216267", name: "A. Robertson", ovr: 82, primaryPosition: "LI", position: "LI", club: "Liverpool", emoji: "\u{1F6E1}\uFE0F", country: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}", nationality: "Escocia" },
  // ================= ARQUEROS (ARQ / _gk) =================
  { id: "230621", name: "G. Donnarumma", ovr: 91, primaryPosition: "ARQ", position: "ARQ", club: "Manchester City", emoji: "\u{1F9E4}", country: "\u{1F1EE}\u{1F1F9}", nationality: "Italia" },
  { id: "212831", name: "Alisson", ovr: 89, primaryPosition: "ARQ", position: "ARQ", club: "Liverpool", emoji: "\u{1F9E4}", country: "\u{1F1E7}\u{1F1F7}", nationality: "Brasil" },
  { id: "192119", name: "T. Courtois", ovr: 89, primaryPosition: "ARQ", position: "ARQ", club: "Real Madrid", emoji: "\u{1F9E4}", country: "\u{1F1E7}\u{1F1EA}", nationality: "B\xE9lgica" },
  { id: "259532", name: "Joan Garc\xEDa", ovr: 89, primaryPosition: "ARQ", position: "ARQ", club: "FC Barcelona", emoji: "\u{1F9E4}", country: "\u{1F1EA}\u{1F1F8}", nationality: "Espa\xF1a" },
  { id: "234577", name: "Diogo Costa", ovr: 89, primaryPosition: "ARQ", position: "ARQ", club: "FC Porto", emoji: "\u{1F9E4}", country: "\u{1F1F5}\u{1F1F9}", nationality: "Portugal" },
  { id: "200389", name: "J. Oblak", ovr: 88, primaryPosition: "ARQ", position: "ARQ", club: "Atl\xE9tico Madrid", emoji: "\u{1F9E4}", country: "\u{1F1F8}\u{1F1EE}", nationality: "Eslovenia" },
  { id: "251752", name: "L. Chevalier", ovr: 88, primaryPosition: "ARQ", position: "ARQ", club: "Paris Saint-Germain", emoji: "\u{1F9E4}", country: "\u{1F1EB}\u{1F1F7}", nationality: "Francia" },
  { id: "220901", name: "David Raya", ovr: 87, primaryPosition: "ARQ", position: "ARQ", club: "Arsenal", emoji: "\u{1F9E4}", country: "\u{1F1EA}\u{1F1F8}", nationality: "Espa\xF1a" },
  { id: "177683", name: "Y. Sommer", ovr: 87, primaryPosition: "ARQ", position: "ARQ", club: "Inter", emoji: "\u{1F9E4}", country: "\u{1F1E8}\u{1F1ED}", nationality: "Suiza" },
  { id: "192448", name: "M. ter Stegen", ovr: 86, primaryPosition: "ARQ", position: "ARQ", club: "FC Barcelona", emoji: "\u{1F9E4}", country: "\u{1F1E9}\u{1F1EA}", nationality: "Alemania" },
  { id: "230869", name: "Unai Sim\xF3n", ovr: 86, primaryPosition: "ARQ", position: "ARQ", club: "Athletic Club", emoji: "\u{1F9E4}", country: "\u{1F1EA}\u{1F1F8}", nationality: "Espa\xF1a" },
  { id: "242879", name: "M. Vandevoordt", ovr: 86, primaryPosition: "ARQ", position: "ARQ", club: "RB Leipzig", emoji: "\u{1F9E4}", country: "\u{1F1E7}\u{1F1EA}", nationality: "B\xE9lgica" },
  { id: "243952", name: "A. Lunin", ovr: 86, primaryPosition: "ARQ", position: "ARQ", club: "Real Madrid", emoji: "\u{1F9E4}", country: "\u{1F1FA}\u{1F1E6}", nationality: "Ucrania" },
  { id: "210257", name: "Ederson", ovr: 85, primaryPosition: "ARQ", position: "ARQ", club: "Fenerbah\xE7e SK", emoji: "\u{1F9E4}", country: "\u{1F1E7}\u{1F1F7}", nationality: "Brasil" },
  { id: "202811", name: "E. Mart\xEDnez", ovr: 85, primaryPosition: "ARQ", position: "ARQ", club: "Aston Villa", emoji: "\u{1F9E4}", country: "\u{1F1E6}\u{1F1F7}", nationality: "Argentina" }
];

// src/data/salto/players.ts
var PLAYERS_SALTO_DB = [
  // ================= ARQUEROS (ARQ) =================
  {
    "id": "salto_arq_1",
    "name": "Pablo Gizzi",
    "ovr": 89,
    "primaryPosition": "ARQ",
    "position": "ARQ",
    "club": "Defensores",
    "emoji": "\u{1F9E4}",
    "country": "\u{1F7E2}\u{1F7E1}",
    "nationality": ""
  },
  //{
  //  "id": "salto_arq_2",
  //  "name": "Joaquin Aristuche",
  //  "ovr": 79,
  //  "primaryPosition": "ARQ",
  //  "position": "ARQ",
  //  "club": "Defensores",
  //  "emoji": "🧤",
  //  "country": "🟢🟡",
  //  "nationality": ""
  //},
  {
    "id": "salto_arq_3",
    "name": "Gonzalo Tomich",
    "ovr": 86,
    "primaryPosition": "ARQ",
    "position": "ARQ",
    "club": "Compa\xF1\xEDa",
    "emoji": "\u{1F9E4}",
    "country": "\u{1F7E2}\u26AA",
    "nationality": ""
  },
  //{
  //  "id": "salto_arq_4",
  //  "name": "Lucas Livio",
  //  "ovr": 79,
  //  "primaryPosition": "ARQ",
  //  "position": "ARQ",
  //  "club": "Compañía",
  //  "emoji": "🧤",
  //  "country": "🟢⚪",
  //  "nationality": ""
  //},
  {
    "id": "salto_arq_5",
    "name": "Franco Rojas",
    "ovr": 85,
    "primaryPosition": "ARQ",
    "position": "ARQ",
    "club": "CUSA",
    "emoji": "\u{1F9E4}",
    "country": "\u26AB\u26AA",
    "nationality": ""
  },
  //{
  //  "id": "salto_arq_6",
  //  "name": "Valentin Lopez",
  //  "ovr": 79,
  //  "primaryPosition": "ARQ",
  //  "position": "ARQ",
  //  "club": "CUSA",
  //  "emoji": "🧤",
  //  "country": "⚫⚪",
  //  "nationality": ""
  //},
  {
    "id": "salto_arq_7",
    "name": "Jonathan Lazatti",
    "ovr": 85,
    "primaryPosition": "ARQ",
    "position": "ARQ",
    "club": "Villa Italia",
    "emoji": "\u{1F9E4}",
    "country": "\u{1F534}\u{1F7E2}",
    "nationality": ""
  },
  {
    "id": "salto_arq_8",
    "name": "Emanuel Charras",
    "ovr": 85,
    "primaryPosition": "ARQ",
    "position": "ARQ",
    "club": "Villa Italia",
    "emoji": "\u{1F9E4}",
    "country": "\u{1F534}\u{1F7E2}",
    "nationality": ""
  },
  {
    "id": "salto_arq_9",
    "name": "Franco Rosales",
    "ovr": 85,
    "primaryPosition": "ARQ",
    "position": "ARQ",
    "club": "Leones",
    "emoji": "\u{1F9E4}",
    "country": "\u{1F7E3}\u26AA",
    "nationality": ""
  },
  //{
  //  "id": "salto_arq_10",
  //  "name": "Amoretti Marcos",
  //  "ovr": 79,
  //  "primaryPosition": "ARQ",
  //  "position": "ARQ",
  //  "club": "Leones",
  //  "emoji": "🧤",
  //  "country": "🟣⚪",
  //  "nationality": ""
  //},
  {
    "id": "salto_arq_11",
    "name": "Nereo Champagne",
    "ovr": 89,
    "primaryPosition": "ARQ",
    "position": "ARQ",
    "club": "Sports",
    "emoji": "\u{1F9E4}",
    "country": "\u{1F534}\u26AB",
    "nationality": ""
  },
  //{
  //  "id": "salto_arq_12",
  //  "name": "Joel Góngora",
  //  "ovr": 79,
  //  "primaryPosition": "ARQ",
  //  "position": "ARQ",
  //  "club": "Sports",
  //  "emoji": "🧤",
  //  "country": "🔴⚫",
  //  "nationality": ""
  //},
  // ================= DEFENSORES CENTRALES (DFC) =================
  {
    "id": "salto_dfc_1",
    "name": "Ferreyra",
    "ovr": 77,
    "primaryPosition": "DFC",
    "position": "DFC",
    "club": "Defensores",
    "emoji": "\u{1F6E1}\uFE0F",
    "country": "\u{1F7E2}\u{1F7E1}",
    "nationality": ""
  },
  {
    "id": "salto_dfc_2",
    "name": "Cabrera",
    "ovr": 82,
    "primaryPosition": "DFC",
    "position": "DFC",
    "club": "Defensores",
    "emoji": "\u{1F6E1}\uFE0F",
    "country": "\u{1F7E2}\u{1F7E1}",
    "nationality": ""
  },
  {
    "id": "salto_dfc_3",
    "name": "Denoya",
    "ovr": 87,
    "primaryPosition": "DFC",
    "position": "DFC",
    "club": "Compa\xF1\xEDa",
    "emoji": "\u{1F6E1}\uFE0F",
    "country": "\u{1F7E2}\u26AA",
    "nationality": ""
  },
  {
    "id": "salto_dfc_4",
    "name": "Acha",
    "ovr": 84,
    "primaryPosition": "DFC",
    "position": "DFC",
    "club": "Compa\xF1\xEDa",
    "emoji": "\u{1F6E1}\uFE0F",
    "country": "\u{1F7E2}\u26AA",
    "nationality": ""
  },
  {
    "id": "salto_dfc_5",
    "name": "Nu\xF1ez",
    "ovr": 84,
    "primaryPosition": "DFC",
    "position": "DFC",
    "club": "CUSA",
    "emoji": "\u{1F6E1}\uFE0F",
    "country": "\u26AB\u26AA",
    "nationality": ""
  },
  {
    "id": "salto_dfc_6",
    "name": "Gianini",
    "ovr": 84,
    "primaryPosition": "DFC",
    "position": "DFC",
    "club": "CUSA",
    "emoji": "\u{1F6E1}\uFE0F",
    "country": "\u26AB\u26AA",
    "nationality": ""
  },
  {
    "id": "salto_dfc_7",
    "name": "Pogonza",
    "ovr": 79,
    "primaryPosition": "DFC",
    "position": "DFC",
    "club": "Villa Italia",
    "emoji": "\u{1F6E1}\uFE0F",
    "country": "\u{1F534}\u{1F7E2}",
    "nationality": ""
  },
  {
    "id": "salto_dfc_8",
    "name": "Gobato",
    "ovr": 76,
    "primaryPosition": "DFC",
    "position": "DFC",
    "club": "Villa Italia",
    "emoji": "\u{1F6E1}\uFE0F",
    "country": "\u{1F534}\u{1F7E2}",
    "nationality": ""
  },
  {
    "id": "salto_dfc_9",
    "name": "Franco Alessandro",
    "ovr": 77,
    "primaryPosition": "DFC",
    "position": "DFC",
    "club": "Leones",
    "emoji": "\u{1F6E1}\uFE0F",
    "country": "\u{1F7E3}\u26AA",
    "nationality": ""
  },
  {
    "id": "salto_dfc_10",
    "name": "Sergio Alessandro",
    "ovr": 79,
    "primaryPosition": "DFC",
    "position": "DFC",
    "club": "Leones",
    "emoji": "\u{1F6E1}\uFE0F",
    "country": "\u{1F7E3}\u26AA",
    "nationality": ""
  },
  {
    "id": "salto_dfc_11",
    "name": "Basualdo",
    "ovr": 82,
    "primaryPosition": "DFC",
    "position": "DFC",
    "club": "Sports",
    "emoji": "\u{1F6E1}\uFE0F",
    "country": "\u{1F534}\u26AB",
    "nationality": ""
  },
  {
    "id": "salto_dfc_12",
    "name": "Capaldi",
    "ovr": 80,
    "primaryPosition": "DFC",
    "position": "DFC",
    "club": "Sports",
    "emoji": "\u{1F6E1}\uFE0F",
    "country": "\u{1F534}\u26AB",
    "nationality": ""
  },
  // ================= LATERALES DERECHOS (LD) =================
  {
    "id": "salto_ld_1",
    "name": "Villegas",
    "ovr": 81,
    "primaryPosition": "LD",
    "position": "LD",
    "club": "Defensores",
    "emoji": "\u{1F6E1}\uFE0F",
    "country": "\u{1F7E2}\u{1F7E1}",
    "nationality": ""
  },
  {
    "id": "salto_ld_2",
    "name": "Paretovich",
    "ovr": 83,
    "primaryPosition": "LD",
    "position": "LD",
    "club": "Compa\xF1\xEDa",
    "emoji": "\u{1F6E1}\uFE0F",
    "country": "\u{1F7E2}\u26AA",
    "nationality": ""
  },
  {
    "id": "salto_ld_3",
    "name": "Dottavio",
    "ovr": 78,
    "primaryPosition": "LD",
    "position": "LD",
    "club": "CUSA",
    "emoji": "\u{1F6E1}\uFE0F",
    "country": "\u26AB\u26AA",
    "nationality": ""
  },
  {
    "id": "salto_ld_4",
    "name": "Gomez",
    "ovr": 74,
    "primaryPosition": "LD",
    "position": "LD",
    "club": "Villa Italia",
    "emoji": "\u{1F6E1}\uFE0F",
    "country": "\u{1F534}\u{1F7E2}",
    "nationality": ""
  },
  {
    "id": "salto_ld_5",
    "name": "Fernandez",
    "ovr": 75,
    "primaryPosition": "LD",
    "position": "LD",
    "club": "Leones",
    "emoji": "\u{1F6E1}\uFE0F",
    "country": "\u{1F7E3}\u26AA",
    "nationality": ""
  },
  {
    "id": "salto_ld_6",
    "name": "Chamorro",
    "ovr": 74,
    "primaryPosition": "LD",
    "position": "LD",
    "club": "Sports",
    "emoji": "\u{1F6E1}\uFE0F",
    "country": "\u{1F534}\u26AB",
    "nationality": ""
  },
  // ================= LATERALES IZQUIERDOS (LI) =================
  {
    "id": "salto_li_1",
    "name": "Fredes",
    "ovr": 87,
    "primaryPosition": "LI",
    "position": "LI",
    "club": "Defensores",
    "emoji": "\u{1F6E1}\uFE0F",
    "country": "\u{1F7E2}\u{1F7E1}",
    "nationality": ""
  },
  {
    "id": "salto_li_2",
    "name": "Bernal",
    "ovr": 82,
    "primaryPosition": "LI",
    "position": "LI",
    "club": "Compa\xF1\xEDa",
    "emoji": "\u{1F6E1}\uFE0F",
    "country": "\u{1F7E2}\u26AA",
    "nationality": ""
  },
  {
    "id": "salto_li_3",
    "name": "Coria",
    "ovr": 75,
    "primaryPosition": "LI",
    "position": "LI",
    "club": "CUSA",
    "emoji": "\u{1F6E1}\uFE0F",
    "country": "\u26AB\u26AA",
    "nationality": ""
  },
  {
    "id": "salto_li_4",
    "name": "Cuello",
    "ovr": 77,
    "primaryPosition": "LI",
    "position": "LI",
    "club": "Villa Italia",
    "emoji": "\u{1F6E1}\uFE0F",
    "country": "\u{1F534}\u{1F7E2}",
    "nationality": ""
  },
  {
    "id": "salto_li_5",
    "name": "Delfrade",
    "ovr": 74,
    "primaryPosition": "LI",
    "position": "LI",
    "club": "Leones",
    "emoji": "\u{1F6E1}\uFE0F",
    "country": "\u{1F7E3}\u26AA",
    "nationality": ""
  },
  {
    "id": "salto_li_6",
    "name": "Jaime Gomez",
    "ovr": 79,
    "primaryPosition": "LI",
    "position": "LI",
    "club": "Sports",
    "emoji": "\u{1F6E1}\uFE0F",
    "country": "\u{1F534}\u26AB",
    "nationality": ""
  },
  // ================= MEDIOCAMPISTAS (MC) =================
  {
    "id": "salto_mc_1",
    "name": "Favergiotti",
    "ovr": 84,
    "primaryPosition": "MC",
    "position": "MC",
    "club": "Defensores",
    "emoji": "\u2699\uFE0F",
    "country": "\u{1F7E2}\u{1F7E1}",
    "nationality": ""
  },
  {
    "id": "salto_mc_2",
    "name": "Gonzalez",
    "ovr": 86,
    "primaryPosition": "MC",
    "position": "MC",
    "club": "Defensores",
    "emoji": "\u2699\uFE0F",
    "country": "\u{1F7E2}\u{1F7E1}",
    "nationality": ""
  },
  {
    "id": "salto_mc_3",
    "name": "Geoghegan",
    "ovr": 84,
    "primaryPosition": "MC",
    "position": "MC",
    "club": "Compa\xF1\xEDa",
    "emoji": "\u2699\uFE0F",
    "country": "\u{1F7E2}\u26AA",
    "nationality": ""
  },
  {
    "id": "salto_mc_4",
    "name": "Paez",
    "ovr": 85,
    "primaryPosition": "MC",
    "position": "MC",
    "club": "Compa\xF1\xEDa",
    "emoji": "\u2699\uFE0F",
    "country": "\u{1F7E2}\u26AA",
    "nationality": ""
  },
  {
    "id": "salto_mc_5",
    "name": "Luna",
    "ovr": 82,
    "primaryPosition": "MC",
    "position": "MC",
    "club": "CUSA",
    "emoji": "\u2699\uFE0F",
    "country": "\u26AB\u26AA",
    "nationality": ""
  },
  {
    "id": "salto_mc_6",
    "name": "Garavano",
    "ovr": 83,
    "primaryPosition": "MC",
    "position": "MC",
    "club": "CUSA",
    "emoji": "\u2699\uFE0F",
    "country": "\u26AB\u26AA",
    "nationality": ""
  },
  {
    "id": "salto_mc_7",
    "name": "Gaspar",
    "ovr": 79,
    "primaryPosition": "MC",
    "position": "MC",
    "club": "Villa Italia",
    "emoji": "\u2699\uFE0F",
    "country": "\u{1F534}\u{1F7E2}",
    "nationality": ""
  },
  {
    "id": "salto_mc_8",
    "name": "Balaguer",
    "ovr": 81,
    "primaryPosition": "MC",
    "position": "MC",
    "club": "Villa Italia",
    "emoji": "\u2699\uFE0F",
    "country": "\u{1F534}\u{1F7E2}",
    "nationality": ""
  },
  {
    "id": "salto_mc_9",
    "name": "Viera",
    "ovr": 75,
    "primaryPosition": "MC",
    "position": "MC",
    "club": "Leones",
    "emoji": "\u2699\uFE0F",
    "country": "\u{1F7E3}\u26AA",
    "nationality": ""
  },
  {
    "id": "salto_mc_10",
    "name": "Quiroz",
    "ovr": 75,
    "primaryPosition": "MC",
    "position": "MC",
    "club": "Leones",
    "emoji": "\u2699\uFE0F",
    "country": "\u{1F7E3}\u26AA",
    "nationality": ""
  },
  {
    "id": "salto_mc_11",
    "name": "Toscano",
    "ovr": 85,
    "primaryPosition": "MC",
    "position": "MC",
    "club": "Sports",
    "emoji": "\u2699\uFE0F",
    "country": "\u{1F534}\u26AB",
    "nationality": ""
  },
  {
    "id": "salto_mc_12",
    "name": "Terzaghi",
    "ovr": 84,
    "primaryPosition": "MC",
    "position": "MC",
    "club": "Sports",
    "emoji": "\u2699\uFE0F",
    "country": "\u{1F534}\u26AB",
    "nationality": ""
  },
  // ================= EXTREMOS DERECHOS (ED) =================
  {
    "id": "salto_ed_1",
    "name": "Romero",
    "ovr": 85,
    "primaryPosition": "ED",
    "position": "ED",
    "club": "Defensores",
    "emoji": "\u26A1",
    "country": "\u{1F7E2}\u{1F7E1}",
    "nationality": ""
  },
  {
    "id": "salto_ed_2",
    "name": "Santana",
    "ovr": 86,
    "primaryPosition": "ED",
    "position": "ED",
    "club": "Compa\xF1\xEDa",
    "emoji": "\u26A1",
    "country": "\u{1F7E2}\u26AA",
    "nationality": ""
  },
  {
    "id": "salto_ed_3",
    "name": "Danura",
    "ovr": 80,
    "primaryPosition": "ED",
    "position": "ED",
    "club": "CUSA",
    "emoji": "\u26A1",
    "country": "\u26AB\u26AA",
    "nationality": ""
  },
  {
    "id": "salto_ed_4",
    "name": "Simaldone",
    "ovr": 81,
    "primaryPosition": "ED",
    "position": "ED",
    "club": "Villa Italia",
    "emoji": "\u26A1",
    "country": "\u{1F534}\u{1F7E2}",
    "nationality": ""
  },
  {
    "id": "salto_ed_5",
    "name": "Moglia",
    "ovr": 78,
    "primaryPosition": "ED",
    "position": "ED",
    "club": "Leones",
    "emoji": "\u26A1",
    "country": "\u{1F7E3}\u26AA",
    "nationality": ""
  },
  {
    "id": "salto_ed_6",
    "name": "Vallejos",
    "ovr": 79,
    "primaryPosition": "ED",
    "position": "ED",
    "club": "Sports",
    "emoji": "\u26A1",
    "country": "\u{1F534}\u26AB",
    "nationality": ""
  },
  // ================= EXTREMOS IZQUIERDOS (EI) =================
  {
    "id": "salto_ei_1",
    "name": "Aita",
    "ovr": 85,
    "primaryPosition": "EI",
    "position": "EI",
    "club": "Defensores",
    "emoji": "\u26A1",
    "country": "\u{1F7E2}\u{1F7E1}",
    "nationality": ""
  },
  {
    "id": "salto_ei_2",
    "name": "Colombini",
    "ovr": 88,
    "primaryPosition": "EI",
    "position": "EI",
    "club": "Compa\xF1\xEDa",
    "emoji": "\u26A1",
    "country": "\u{1F7E2}\u26AA",
    "nationality": ""
  },
  {
    "id": "salto_ei_3",
    "name": "Margineda",
    "ovr": 82,
    "primaryPosition": "EI",
    "position": "EI",
    "club": "CUSA",
    "emoji": "\u26A1",
    "country": "\u26AB\u26AA",
    "nationality": ""
  },
  {
    "id": "salto_ei_4",
    "name": "Chavez",
    "ovr": 83,
    "primaryPosition": "EI",
    "position": "EI",
    "club": "Villa Italia",
    "emoji": "\u26A1",
    "country": "\u{1F534}\u{1F7E2}",
    "nationality": ""
  },
  {
    "id": "salto_ei_5",
    "name": "Maco Alessandro",
    "ovr": 84,
    "primaryPosition": "EI",
    "position": "EI",
    "club": "Leones",
    "emoji": "\u26A1",
    "country": "\u{1F7E3}\u26AA",
    "nationality": ""
  },
  {
    "id": "salto_ei_6",
    "name": "Marcos Romero",
    "ovr": 84,
    "primaryPosition": "EI",
    "position": "EI",
    "club": "Sports",
    "emoji": "\u26A1",
    "country": "\u{1F534}\u26AB",
    "nationality": ""
  },
  // ================= DELANTEROS CENTRO (DC) =================
  {
    "id": "salto_dc_1",
    "name": "Lazatti",
    "ovr": 80,
    "primaryPosition": "DC",
    "position": "DC",
    "club": "Defensores",
    "emoji": "\u26BD",
    "country": "\u{1F7E2}\u{1F7E1}",
    "nationality": ""
  },
  {
    "id": "salto_dc_2",
    "name": "Gutierrez",
    "ovr": 81,
    "primaryPosition": "DC",
    "position": "DC",
    "club": "Defensores",
    "emoji": "\u26BD",
    "country": "\u{1F7E2}\u{1F7E1}",
    "nationality": ""
  },
  {
    "id": "salto_dc_3",
    "name": "Kevin Chee",
    "ovr": 80,
    "primaryPosition": "DC",
    "position": "DC",
    "club": "Compa\xF1\xEDa",
    "emoji": "\u26BD",
    "country": "\u{1F7E2}\u26AA",
    "nationality": ""
  },
  {
    "id": "salto_dc_4",
    "name": "Jofr\xE9",
    "ovr": 79,
    "primaryPosition": "DC",
    "position": "DC",
    "club": "CUSA",
    "emoji": "\u26BD",
    "country": "\u26AB\u26AA",
    "nationality": ""
  },
  {
    "id": "salto_dc_5",
    "name": "Tegaldi",
    "ovr": 78,
    "primaryPosition": "DC",
    "position": "DC",
    "club": "Villa Italia",
    "emoji": "\u26BD",
    "country": "\u{1F534}\u{1F7E2}",
    "nationality": ""
  },
  {
    "id": "salto_dc_6",
    "name": "Beltr\xE1n",
    "ovr": 77,
    "primaryPosition": "DC",
    "position": "DC",
    "club": "Leones",
    "emoji": "\u26BD",
    "country": "\u{1F7E3}\u26AA",
    "nationality": ""
  },
  {
    "id": "salto_dc_7",
    "name": "Blas Dominguez",
    "ovr": 78,
    "primaryPosition": "DC",
    "position": "DC",
    "club": "Sports",
    "emoji": "\u26BD",
    "country": "\u{1F534}\u26AB",
    "nationality": ""
  }
];

// src/utils/rng.ts
function stringToSeed(str) {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

// src/utils/seedCode.ts
function getUtcTimestampSecondPrecision(date = /* @__PURE__ */ new Date()) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  const ss = String(date.getUTCSeconds()).padStart(2, "0");
  return `${y}-${m}-${d} ${hh}:${mm}:${ss} UTC`;
}
function encodeRunCode(seed, mode, formationIndex = 0) {
  const modeCode = mode === "FUTBOL11" ? "11" : mode === "FUTBOL11_SALTO" ? "1S" : "05";
  const rawSeedHex = (seed >>> 0).toString(16).toUpperCase().padStart(8, "0");
  let checksum = 0;
  for (let i = 0; i < rawSeedHex.length; i++) {
    checksum = (checksum + rawSeedHex.charCodeAt(i)) % 36;
  }
  const checksumChar = checksum.toString(36).toUpperCase();
  const part1 = rawSeedHex.slice(0, 4);
  const part2 = rawSeedHex.slice(4, 8);
  return `SDT-${modeCode}-${part1}-${part2}${checksumChar}`;
}
function generateSeedForRun(mode, customDate) {
  const utcTs = getUtcTimestampSecondPrecision(customDate);
  const prefix = mode === "FUTBOL11" ? "SOYDT-F11" : mode === "FUTBOL11_SALTO" ? "SOYDT-SALTO" : "SOYDT-F5";
  return {
    seed: stringToSeed(`${prefix}-${utcTs}`),
    seedString: utcTs
  };
}

// server/db.ts
var INITIAL_FALLBACK_RECORDS = {
  FUTBOL11_SALTO: { score: 938, holder: "JOTA" },
  FUTBOL11: { score: 988, holder: "AGUST\xCDN B." },
  FUTBOL5: { score: 472, holder: "SANTINO M." }
};
var sqlClient = null;
var isInitialized = false;
function getSqlClient() {
  const dbUrl = process.env.DATABASE_URL?.trim();
  if (!dbUrl) {
    return null;
  }
  if (!sqlClient) {
    sqlClient = neon(dbUrl);
  }
  return sqlClient;
}
async function ensureTablesExist() {
  const sql = getSqlClient();
  if (!sql) return false;
  if (isInitialized) return true;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        email VARCHAR(150) UNIQUE,
        device_id VARCHAR(100),
        auth_provider VARCHAR(50) DEFAULT 'anonymous',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_active_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS runs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        player_name VARCHAR(100) NOT NULL,
        mode VARCHAR(50) NOT NULL,
        score INTEGER NOT NULL,
        formation_name VARCHAR(50),
        ranking_tier VARCHAR(100),
        run_code VARCHAR(100),
        selected_players JSONB,
        events_enabled BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS records (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        player_name VARCHAR(100) NOT NULL,
        mode VARCHAR(50) NOT NULL,
        best_score INTEGER NOT NULL,
        best_run_id INTEGER REFERENCES runs(id) ON DELETE SET NULL,
        run_code VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_user_mode UNIQUE (user_id, mode)
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_runs_mode_score ON runs (mode, score DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_records_mode_score ON records (mode, best_score DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_runs_created_at ON runs (created_at DESC)`;
    await sql`
      CREATE TABLE IF NOT EXISTS friend_rooms (
        id SERIAL PRIMARY KEY,
        code VARCHAR(12) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        mode VARCHAR(50) NOT NULL,
        run_code VARCHAR(100) NOT NULL,
        created_by VARCHAR(50) NOT NULL,
        max_players INTEGER DEFAULT 10,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS friend_room_entries (
        id SERIAL PRIMARY KEY,
        room_code VARCHAR(12) NOT NULL,
        player_name VARCHAR(50) NOT NULL,
        score INTEGER NOT NULL,
        formation_name VARCHAR(50),
        ranking_tier VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_room_player UNIQUE (room_code, player_name)
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_room_entries_score ON friend_room_entries (room_code, score DESC, created_at ASC)`;
    await sql`
      CREATE TABLE IF NOT EXISTS stats (
        id SERIAL PRIMARY KEY,
        mode VARCHAR(50) NOT NULL,
        username VARCHAR(100) NOT NULL,
        score INTEGER,
        formation_name VARCHAR(50),
        run_code VARCHAR(100),
        device_info JSONB,
        user_agent TEXT,
        device_type VARCHAR(30),
        is_mobile BOOLEAN,
        screen_resolution VARCHAR(50),
        ip VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_stats_created_at ON stats (created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_stats_mode ON stats (mode)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_stats_username ON stats (username)`;
    isInitialized = true;
    console.log("[Neon DB] Tables (users, runs, records, friend_rooms, friend_room_entries, stats) verified successfully.");
    return true;
  } catch (error) {
    console.error("[Neon DB] Error creating tables:", error);
    return false;
  }
}
async function fetchGlobalMaxRecords() {
  const sql = getSqlClient();
  if (!sql) {
    return {
      connected: false,
      records: { ...INITIAL_FALLBACK_RECORDS }
    };
  }
  try {
    await ensureTablesExist();
    const rows = await sql`
      WITH RankedRuns AS (
        SELECT 
          mode, 
          score, 
          player_name,
          ROW_NUMBER() OVER (PARTITION BY mode ORDER BY score DESC, created_at ASC) as rn
        FROM runs
      )
      SELECT mode, score, player_name 
      FROM RankedRuns 
      WHERE rn = 1
    `;
    const records = { ...INITIAL_FALLBACK_RECORDS };
    for (const row of rows) {
      const mode = row.mode;
      if (mode && records[mode]) {
        if (Number(row.score) >= records[mode].score) {
          records[mode] = {
            score: Number(row.score),
            holder: String(row.player_name || "AN\xD3NIMO").trim().toUpperCase()
          };
        }
      }
    }
    return {
      connected: true,
      records
    };
  } catch (error) {
    console.error("[Neon DB] Error querying global records:", error);
    return {
      connected: false,
      records: { ...INITIAL_FALLBACK_RECORDS }
    };
  }
}
async function insertGameRecord(params) {
  const sql = getSqlClient();
  if (!sql) {
    return { success: false, error: "DATABASE_URL not configured" };
  }
  try {
    await ensureTablesExist();
    const cleanName = (params.playerName || "DT AN\xD3NIMO").trim().slice(0, 50).toUpperCase();
    const cleanScore = Math.round(params.score);
    const cleanMode = params.mode.trim();
    const cleanRunCode = (params.runCode || "").trim();
    const cleanFormation = (params.formationName || "").trim();
    const cleanTier = (params.rankingTier || "").trim();
    const eventsEnabled = params.eventsEnabled ?? true;
    const selectedPlayersJson = params.selectedPlayers ? JSON.stringify(params.selectedPlayers) : null;
    const prevMax = await sql`
      SELECT COALESCE(MAX(score), 0) as max_score 
      FROM runs 
      WHERE mode = ${cleanMode}
    `;
    const previousHighScore = Number(prevMax[0]?.max_score || 0);
    const inserted = await sql`
      INSERT INTO runs (
        player_name, 
        mode, 
        score, 
        formation_name, 
        ranking_tier, 
        run_code, 
        selected_players, 
        events_enabled
      )
      VALUES (
        ${cleanName}, 
        ${cleanMode}, 
        ${cleanScore}, 
        ${cleanFormation}, 
        ${cleanTier}, 
        ${cleanRunCode}, 
        ${selectedPlayersJson}::jsonb, 
        ${eventsEnabled}
      )
      RETURNING id
    `;
    const newRunId = Number(inserted[0]?.id);
    const isNewGlobalRecord = cleanScore > previousHighScore;
    return {
      success: true,
      runId: newRunId,
      isNewGlobalRecord
    };
  } catch (error) {
    console.error("[Neon DB] Error inserting run record:", error);
    return { success: false, error: String(error) };
  }
}
async function updateRunPlayerName(runId, playerName) {
  const sql = getSqlClient();
  if (!sql) {
    return { success: false, error: "DATABASE_URL not configured" };
  }
  try {
    const cleanName = (playerName || "DT AN\xD3NIMO").trim().slice(0, 50).toUpperCase();
    await sql`
      UPDATE runs 
      SET player_name = ${cleanName}
      WHERE id = ${runId}
    `;
    return { success: true };
  } catch (error) {
    console.error("[Neon DB] Error updating run player_name:", error);
    return { success: false, error: String(error) };
  }
}
async function getRecentRunsForPlayer(playerName, limit = 5) {
  const sql = getSqlClient();
  if (!sql) return [];
  try {
    await ensureTablesExist();
    const cleanName = (playerName || "DT").trim().toUpperCase();
    const rows = await sql`
      SELECT id, mode, score, formation_name, ranking_tier, run_code, events_enabled, created_at
      FROM runs
      WHERE UPPER(player_name) = ${cleanName}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
    return rows;
  } catch (error) {
    console.error("[Neon DB] Error getting recent runs for player:", error);
    return [];
  }
}
var FALLBACK_LEADERBOARD = {
  FUTBOL11_SALTO: [
    { playerName: "JOTA", score: 938, eventsEnabled: true },
    { playerName: "NICO R.", score: 902, eventsEnabled: true },
    { playerName: "LEO M.", score: 876, eventsEnabled: false }
  ],
  FUTBOL11: [
    { playerName: "AGUST\xCDN B.", score: 988, eventsEnabled: true },
    { playerName: "MATEO G.", score: 945, eventsEnabled: true },
    { playerName: "FRANCO D.", score: 912, eventsEnabled: true }
  ],
  FUTBOL5: [
    { playerName: "SANTINO M.", score: 472, eventsEnabled: true },
    { playerName: "LUCAS P.", score: 458, eventsEnabled: true },
    { playerName: "BRUNO T.", score: 430, eventsEnabled: false }
  ]
};
async function fetchLeaderboardTop3() {
  const sql = getSqlClient();
  if (!sql) {
    return {
      connected: false,
      leaderboard: {
        FUTBOL11_SALTO: FALLBACK_LEADERBOARD.FUTBOL11_SALTO.map((item, idx) => ({ rank: idx + 1, ...item })),
        FUTBOL11: FALLBACK_LEADERBOARD.FUTBOL11.map((item, idx) => ({ rank: idx + 1, ...item })),
        FUTBOL5: FALLBACK_LEADERBOARD.FUTBOL5.map((item, idx) => ({ rank: idx + 1, ...item }))
      }
    };
  }
  try {
    await ensureTablesExist();
    const modes = ["FUTBOL11_SALTO", "FUTBOL11", "FUTBOL5"];
    const result = {};
    for (const mode of modes) {
      const rows = await sql`
        SELECT player_name, score, events_enabled
        FROM runs
        WHERE mode = ${mode}
        ORDER BY score DESC, created_at ASC
        LIMIT 3
      `;
      const dbEntries = rows.map((r) => ({
        playerName: String(r.player_name || "DT").trim().toUpperCase(),
        score: Number(r.score) || 0,
        eventsEnabled: r.events_enabled !== false
      }));
      const combined = [...dbEntries];
      const fallbackList = FALLBACK_LEADERBOARD[mode] || [];
      for (const fb of fallbackList) {
        if (combined.length >= 3) break;
        if (!combined.some((c) => c.playerName === fb.playerName && c.score === fb.score)) {
          combined.push(fb);
        }
      }
      combined.sort((a, b) => b.score - a.score);
      result[mode] = combined.slice(0, 3).map((item, idx) => ({
        rank: idx + 1,
        playerName: item.playerName,
        score: item.score,
        eventsEnabled: item.eventsEnabled
      }));
    }
    return {
      connected: true,
      leaderboard: result
    };
  } catch (error) {
    console.error("[Neon DB] Error querying leaderboard top 3:", error);
    return {
      connected: false,
      leaderboard: {
        FUTBOL11_SALTO: FALLBACK_LEADERBOARD.FUTBOL11_SALTO.map((item, idx) => ({ rank: idx + 1, ...item })),
        FUTBOL11: FALLBACK_LEADERBOARD.FUTBOL11.map((item, idx) => ({ rank: idx + 1, ...item })),
        FUTBOL5: FALLBACK_LEADERBOARD.FUTBOL5.map((item, idx) => ({ rank: idx + 1, ...item }))
      }
    };
  }
}
async function checkConnection() {
  const sql = getSqlClient();
  if (!sql) {
    return {
      connected: false,
      message: "DATABASE_URL no est\xE1 configurada en las variables de entorno."
    };
  }
  try {
    const result = await sql`SELECT NOW() as current_time`;
    return {
      connected: true,
      message: `Conexi\xF3n a Neon PostgreSQL exitosa. Timestamp del servidor: ${result[0]?.current_time}`
    };
  } catch (error) {
    return {
      connected: false,
      message: `Error al conectar con Neon: ${error?.message || error}`
    };
  }
}
var PLAYERS_CACHE = {};
var CACHE_TTL_MS = 1e3 * 60 * 5;
async function fetchPlayersFromDb(datasetFilter, bypassCache = false) {
  const targetDataset = datasetFilter || "ALL";
  const now = Date.now();
  if (!bypassCache && PLAYERS_CACHE[targetDataset]) {
    const cached = PLAYERS_CACHE[targetDataset];
    if (now - cached.timestamp < CACHE_TTL_MS) {
      return {
        success: true,
        count: cached.data.length,
        dataset: targetDataset,
        source: "cache",
        players: cached.data
      };
    }
  }
  const sql = getSqlClient();
  if (!sql) {
    console.warn("[Neon DB] No DATABASE_URL found, using local fallback players");
    const fallbackList = targetDataset === "SALTO" ? PLAYERS_SALTO_DB : targetDataset === "GLOBAL" ? PLAYERS_DB : [...PLAYERS_DB, ...PLAYERS_SALTO_DB];
    return {
      success: true,
      count: fallbackList.length,
      dataset: targetDataset,
      source: "fallback",
      players: fallbackList
    };
  }
  try {
    let rows = [];
    if (targetDataset === "SALTO") {
      rows = await sql`
        SELECT 
          id, 
          name, 
          ovr, 
          primary_position AS "primaryPosition", 
          position, 
          club, 
          COALESCE(emoji, '') AS emoji, 
          COALESCE(country, '') AS country, 
          COALESCE(nationality, '') AS nationality,
          COALESCE(dataset, 'SALTO') AS dataset
        FROM players
        WHERE dataset = 'SALTO' OR id LIKE 'salto_%'
        ORDER BY ovr DESC, name ASC;
      `;
    } else if (targetDataset === "GLOBAL") {
      rows = await sql`
        SELECT 
          id, 
          name, 
          ovr, 
          primary_position AS "primaryPosition", 
          position, 
          club, 
          COALESCE(emoji, '') AS emoji, 
          COALESCE(country, '') AS country, 
          COALESCE(nationality, '') AS nationality,
          COALESCE(dataset, 'GLOBAL') AS dataset
        FROM players
        WHERE (dataset = 'GLOBAL' OR dataset IS NULL) AND id NOT LIKE 'salto_%'
        ORDER BY ovr DESC, name ASC;
      `;
    } else {
      rows = await sql`
        SELECT 
          id, 
          name, 
          ovr, 
          primary_position AS "primaryPosition", 
          position, 
          club, 
          COALESCE(emoji, '') AS emoji, 
          COALESCE(country, '') AS country, 
          COALESCE(nationality, '') AS nationality,
          COALESCE(dataset, 'GLOBAL') AS dataset
        FROM players
        ORDER BY ovr DESC, name ASC;
      `;
    }
    const mappedPlayers = rows.map((r) => ({
      id: String(r.id),
      name: String(r.name),
      ovr: Number(r.ovr),
      primaryPosition: String(r.primaryPosition || r.position),
      position: String(r.position || r.primaryPosition),
      club: String(r.club || ""),
      emoji: String(r.emoji || ""),
      country: String(r.country || ""),
      nationality: String(r.nationality || ""),
      dataset: String(r.dataset || "")
    }));
    PLAYERS_CACHE[targetDataset] = {
      data: mappedPlayers,
      timestamp: now
    };
    return {
      success: true,
      count: mappedPlayers.length,
      dataset: targetDataset,
      source: "db",
      players: mappedPlayers
    };
  } catch (err) {
    console.error("[Neon DB] Error querying players from database, using fallback:", err);
    const fallbackList = targetDataset === "SALTO" ? PLAYERS_SALTO_DB : targetDataset === "GLOBAL" ? PLAYERS_DB : [...PLAYERS_DB, ...PLAYERS_SALTO_DB];
    return {
      success: true,
      count: fallbackList.length,
      dataset: targetDataset,
      source: "fallback",
      players: fallbackList
    };
  }
}
var MEMORY_ROOMS = /* @__PURE__ */ new Map();
var MEMORY_ROOM_ENTRIES = /* @__PURE__ */ new Map();
function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
async function createFriendRoom(params) {
  const cleanMode = params.mode === "FUTBOL11_SALTO" ? "FUTBOL11_SALTO" : "FUTBOL11";
  const cleanName = (params.name || "El Trofeo de la Fecha").trim().slice(0, 50) || "El Trofeo de la Fecha";
  const cleanCreatedBy = (params.createdBy || "DT").trim().slice(0, 30).toUpperCase() || "DT";
  const { seed } = generateSeedForRun(cleanMode);
  const runCode = encodeRunCode(seed, cleanMode, 0);
  const sql = getSqlClient();
  let code = generateRoomCode();
  if (sql) {
    try {
      await ensureTablesExist();
      let attempts = 0;
      while (attempts < 5) {
        const existing = await sql`SELECT id FROM friend_rooms WHERE code = ${code} LIMIT 1`;
        if (existing.length === 0) break;
        code = generateRoomCode();
        attempts++;
      }
      await sql`
        INSERT INTO friend_rooms (code, name, mode, run_code, created_by, max_players)
        VALUES (${code}, ${cleanName}, ${cleanMode}, ${runCode}, ${cleanCreatedBy}, 10)
      `;
      return {
        success: true,
        room: {
          code,
          name: cleanName,
          mode: cleanMode,
          runCode,
          createdBy: cleanCreatedBy,
          maxPlayers: 10,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          entries: [],
          totalPlayers: 0,
          isFull: false
        }
      };
    } catch (err) {
      console.error("[Neon DB] Error creating friend room in DB, fallback to memory:", err);
    }
  }
  MEMORY_ROOMS.set(code, {
    code,
    name: cleanName,
    mode: cleanMode,
    runCode,
    createdBy: cleanCreatedBy,
    maxPlayers: 10,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  });
  MEMORY_ROOM_ENTRIES.set(code, []);
  return {
    success: true,
    room: {
      code,
      name: cleanName,
      mode: cleanMode,
      runCode,
      createdBy: cleanCreatedBy,
      maxPlayers: 10,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      entries: [],
      totalPlayers: 0,
      isFull: false
    }
  };
}
async function getFriendRoom(code) {
  const cleanCode = (code || "").trim().toUpperCase();
  if (!cleanCode) {
    return { success: false, error: "C\xD3DIGO_INV\xC1LIDO" };
  }
  const sql = getSqlClient();
  if (sql) {
    try {
      await ensureTablesExist();
      const roomRows = await sql`
        SELECT code, name, mode, run_code, created_by, max_players, created_at
        FROM friend_rooms
        WHERE code = ${cleanCode}
        LIMIT 1
      `;
      if (roomRows.length === 0) {
        const memRoom2 = MEMORY_ROOMS.get(cleanCode);
        if (!memRoom2) {
          return { success: false, error: "SALA_NO_ENCONTRADA" };
        }
        const memEntries2 = MEMORY_ROOM_ENTRIES.get(cleanCode) || [];
        const sortedMem2 = [...memEntries2].sort((a, b) => b.score - a.score);
        return {
          success: true,
          room: {
            ...memRoom2,
            entries: sortedMem2.map((e, idx) => ({ ...e, rank: idx + 1 })),
            totalPlayers: sortedMem2.length,
            isFull: sortedMem2.length >= memRoom2.maxPlayers
          }
        };
      }
      const r = roomRows[0];
      const entryRows = await sql`
        SELECT id, player_name, score, formation_name, ranking_tier, created_at
        FROM friend_room_entries
        WHERE room_code = ${cleanCode}
        ORDER BY score DESC, created_at ASC
      `;
      const entries = entryRows.map((e, idx) => ({
        id: Number(e.id),
        playerName: String(e.player_name),
        score: Number(e.score),
        formationName: e.formation_name ? String(e.formation_name) : void 0,
        rankingTier: e.ranking_tier ? String(e.ranking_tier) : void 0,
        createdAt: e.created_at ? new Date(e.created_at).toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
        rank: idx + 1
      }));
      const maxPlayers = Number(r.max_players) || 10;
      return {
        success: true,
        room: {
          code: String(r.code),
          name: String(r.name),
          mode: String(r.mode),
          runCode: String(r.run_code),
          createdBy: String(r.created_by),
          maxPlayers,
          createdAt: r.created_at ? new Date(r.created_at).toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
          entries,
          totalPlayers: entries.length,
          isFull: entries.length >= maxPlayers
        }
      };
    } catch (err) {
      console.error("[Neon DB] Error getting friend room from DB:", err);
    }
  }
  const memRoom = MEMORY_ROOMS.get(cleanCode);
  if (!memRoom) {
    return { success: false, error: "SALA_NO_ENCONTRADA" };
  }
  const memEntries = MEMORY_ROOM_ENTRIES.get(cleanCode) || [];
  const sortedMem = [...memEntries].sort((a, b) => b.score - a.score);
  return {
    success: true,
    room: {
      ...memRoom,
      entries: sortedMem.map((e, idx) => ({ ...e, rank: idx + 1 })),
      totalPlayers: sortedMem.length,
      isFull: sortedMem.length >= memRoom.maxPlayers
    }
  };
}
async function addFriendRoomEntry(params) {
  const cleanCode = (params.roomCode || "").trim().toUpperCase();
  const cleanName = (params.playerName || "DT").trim().slice(0, 30).toUpperCase();
  const cleanScore = Math.round(params.score);
  if (!cleanCode || !cleanName) {
    return { success: false, error: "DATOS_INV\xC1LIDOS", message: "C\xF3digo de sala y nombre son requeridos" };
  }
  const sql = getSqlClient();
  if (sql) {
    try {
      await ensureTablesExist();
      const roomRows = await sql`
        SELECT code, max_players FROM friend_rooms WHERE code = ${cleanCode} LIMIT 1
      `;
      if (roomRows.length === 0) {
        return { success: false, error: "SALA_NO_ENCONTRADA", message: "La sala especificada no existe" };
      }
      const maxPlayers = Number(roomRows[0].max_players) || 10;
      const entries = await sql`
        SELECT player_name FROM friend_room_entries WHERE room_code = ${cleanCode}
      `;
      if (entries.length >= maxPlayers) {
        return { success: false, error: "SALA_LLENA", message: "La sala ya alcanz\xF3 el m\xE1ximo de 10 participantes" };
      }
      const alreadyExists = entries.some(
        (e) => String(e.player_name).toUpperCase() === cleanName
      );
      if (alreadyExists) {
        return {
          success: false,
          error: "APODO_YA_UTILIZADO",
          message: "Este apodo ya jug\xF3 su partido en esta sala. Solo se permite 1 intento por persona."
        };
      }
      await sql`
        INSERT INTO friend_room_entries (room_code, player_name, score, formation_name, ranking_tier)
        VALUES (${cleanCode}, ${cleanName}, ${cleanScore}, ${params.formationName || null}, ${params.rankingTier || null})
      `;
      const updated = await sql`
        SELECT player_name, score FROM friend_room_entries 
        WHERE room_code = ${cleanCode}
        ORDER BY score DESC, created_at ASC
      `;
      const rank2 = updated.findIndex((e) => String(e.player_name).toUpperCase() === cleanName) + 1;
      return {
        success: true,
        rank: rank2 > 0 ? rank2 : updated.length,
        totalPlayers: updated.length
      };
    } catch (err) {
      console.error("[Neon DB] Error adding friend room entry to DB:", err);
    }
  }
  const memRoom = MEMORY_ROOMS.get(cleanCode);
  if (!memRoom) {
    return { success: false, error: "SALA_NO_ENCONTRADA", message: "La sala no existe" };
  }
  const currentEntries = MEMORY_ROOM_ENTRIES.get(cleanCode) || [];
  if (currentEntries.length >= memRoom.maxPlayers) {
    return { success: false, error: "SALA_LLENA", message: "La sala ya est\xE1 llena" };
  }
  if (currentEntries.some((e) => e.playerName.toUpperCase() === cleanName)) {
    return {
      success: false,
      error: "APODO_YA_UTILIZADO",
      message: "Este apodo ya jug\xF3 en esta sala (1 intento por persona)"
    };
  }
  currentEntries.push({
    roomCode: cleanCode,
    playerName: cleanName,
    score: cleanScore,
    formationName: params.formationName,
    rankingTier: params.rankingTier,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  });
  MEMORY_ROOM_ENTRIES.set(cleanCode, currentEntries);
  currentEntries.sort((a, b) => b.score - a.score);
  const rank = currentEntries.findIndex((e) => e.playerName === cleanName) + 1;
  return {
    success: true,
    rank: rank > 0 ? rank : currentEntries.length,
    totalPlayers: currentEntries.length
  };
}
async function deleteFriendRoom(code) {
  const cleanCode = (code || "").trim().toUpperCase();
  if (!cleanCode) {
    return { success: false, error: "C\xD3DIGO_INV\xC1LIDO" };
  }
  const sql = getSqlClient();
  if (sql) {
    try {
      await ensureTablesExist();
      await sql`DELETE FROM friend_room_entries WHERE room_code = ${cleanCode}`;
      await sql`DELETE FROM friend_rooms WHERE code = ${cleanCode}`;
    } catch (err) {
      console.error("[Neon DB] Error deleting friend room:", err);
    }
  }
  MEMORY_ROOMS.delete(cleanCode);
  MEMORY_ROOM_ENTRIES.delete(cleanCode);
  return { success: true };
}
var MEMORY_STATS = [];
async function saveGameStat(params) {
  const cleanMode = (params.mode || "FUTBOL11").trim().toUpperCase();
  const cleanUsername = (params.username || "DT").trim().toUpperCase();
  const cleanScore = typeof params.score === "number" ? params.score : null;
  const formationName = params.formationName ? String(params.formationName).slice(0, 50) : null;
  const runCode = params.runCode ? String(params.runCode).slice(0, 100) : null;
  const deviceInfo = params.deviceInfo || {};
  const userAgent = params.userAgent || (typeof deviceInfo.userAgent === "string" ? deviceInfo.userAgent : "");
  const deviceType = deviceInfo.deviceType ? String(deviceInfo.deviceType).slice(0, 30) : null;
  const isMobile = typeof deviceInfo.isMobile === "boolean" ? deviceInfo.isMobile : null;
  const screenRes = deviceInfo.screenResolution ? String(deviceInfo.screenResolution).slice(0, 50) : null;
  const ip = params.ip ? String(params.ip).slice(0, 100) : "";
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const sql = getSqlClient();
  if (sql) {
    try {
      await ensureTablesExist();
      const rows = await sql`
        INSERT INTO stats (
          mode, 
          username, 
          score, 
          formation_name, 
          run_code, 
          device_info, 
          user_agent, 
          device_type, 
          is_mobile, 
          screen_resolution, 
          ip, 
          created_at
        )
        VALUES (
          ${cleanMode}, 
          ${cleanUsername}, 
          ${cleanScore}, 
          ${formationName}, 
          ${runCode}, 
          ${JSON.stringify(deviceInfo)}, 
          ${userAgent}, 
          ${deviceType}, 
          ${isMobile}, 
          ${screenRes}, 
          ${ip}, 
          CURRENT_TIMESTAMP
        )
        RETURNING id
      `;
      if (rows && rows.length > 0) {
        return { success: true, id: rows[0].id };
      }
    } catch (err) {
      console.error("[Neon DB] Error saving game stat:", err);
    }
  }
  const memRecord = {
    id: MEMORY_STATS.length + 1,
    mode: cleanMode,
    username: cleanUsername,
    score: cleanScore ?? void 0,
    formation_name: formationName ?? void 0,
    run_code: runCode ?? void 0,
    device_info: deviceInfo,
    user_agent: userAgent,
    device_type: deviceType ?? void 0,
    is_mobile: isMobile ?? void 0,
    screen_resolution: screenRes ?? void 0,
    ip,
    created_at: now
  };
  MEMORY_STATS.push(memRecord);
  if (MEMORY_STATS.length > 500) {
    MEMORY_STATS.shift();
  }
  return { success: true, id: memRecord.id };
}
async function getGameStats(limit = 50) {
  const sql = getSqlClient();
  if (sql) {
    try {
      await ensureTablesExist();
      const rows = await sql`
        SELECT 
          id, 
          mode, 
          username, 
          score, 
          formation_name, 
          run_code, 
          device_info, 
          user_agent, 
          device_type, 
          is_mobile, 
          screen_resolution, 
          ip, 
          created_at
        FROM stats
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
      return rows;
    } catch (err) {
      console.error("[Neon DB] Error fetching stats:", err);
    }
  }
  return [...MEMORY_STATS].reverse().slice(0, limit);
}

// server/app.ts
dotenv.config();
function createExpressApp() {
  const app2 = express();
  app2.use(express.json());
  app2.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }
    next();
  });
  const apiRouter = express.Router();
  apiRouter.get("/health", (_req, res) => {
    res.json({ status: "ok", server: "SoyDT Express Server" });
  });
  apiRouter.get("/records/status", async (_req, res) => {
    try {
      const status = await checkConnection();
      res.json(status);
    } catch (err) {
      res.status(500).json({ connected: false, message: err?.message || "Unknown error" });
    }
  });
  apiRouter.get("/records/global", async (_req, res) => {
    try {
      const data = await fetchGlobalMaxRecords();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err?.message || "Failed to fetch global records" });
    }
  });
  apiRouter.post("/records", async (req, res) => {
    try {
      const {
        mode,
        score,
        playerName,
        formationName,
        rankingTier,
        runCode,
        selectedPlayers,
        eventsEnabled
      } = req.body || {};
      if (!mode || typeof score !== "number") {
        res.status(400).json({ error: "Par\xE1metros inv\xE1lidos: mode y score son requeridos." });
        return;
      }
      const result = await insertGameRecord({
        mode,
        score,
        playerName,
        formationName,
        rankingTier,
        runCode,
        selectedPlayers,
        eventsEnabled
      });
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err?.message || "Error guardando registro" });
    }
  });
  apiRouter.post("/records/update-name", async (req, res) => {
    try {
      const { runId, playerName } = req.body || {};
      if (!runId || !playerName) {
        res.status(400).json({ error: "runId y playerName son requeridos." });
        return;
      }
      const result = await updateRunPlayerName(Number(runId), String(playerName));
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err?.message || "Error actualizando nombre" });
    }
  });
  apiRouter.get("/records/recent-player", async (req, res) => {
    try {
      const playerName = String(req.query.name || "DT");
      const runs = await getRecentRunsForPlayer(playerName, 5);
      res.json({ success: true, runs });
    } catch (err) {
      res.status(500).json({ error: err?.message || "Error obteniendo historial" });
    }
  });
  apiRouter.get("/records/leaderboard", async (_req, res) => {
    try {
      const data = await fetchLeaderboardTop3();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err?.message || "Error obteniendo leaderboard" });
    }
  });
  apiRouter.get("/players", async (req, res) => {
    try {
      const modeParam = String(req.query.mode || "").trim().toLowerCase();
      const datasetParam = String(req.query.dataset || "").trim().toUpperCase();
      const refreshParam = req.query.refresh === "true" || req.query.refresh === "1";
      let datasetFilter = "ALL";
      if (modeParam === "salto" || modeParam === "futbol11_salto" || datasetParam === "SALTO") {
        datasetFilter = "SALTO";
      } else if (modeParam === "global" || modeParam === "futbol11" || modeParam === "futbol5" || datasetParam === "GLOBAL") {
        datasetFilter = "GLOBAL";
      } else if (datasetParam === "ALL") {
        datasetFilter = "ALL";
      }
      const result = await fetchPlayersFromDb(datasetFilter, refreshParam);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err?.message || "Error obteniendo jugadores" });
    }
  });
  apiRouter.post("/rooms", async (req, res) => {
    try {
      const { name, mode, createdBy } = req.body || {};
      const result = await createFriendRoom({ name, mode, createdBy });
      if (!result.success) {
        return res.status(400).json(result);
      }
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, error: err?.message || "Error creando sala" });
    }
  });
  apiRouter.get("/rooms/:code", async (req, res) => {
    try {
      const code = String(req.params.code || "").trim().toUpperCase();
      const result = await getFriendRoom(code);
      if (!result.success) {
        return res.status(404).json(result);
      }
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, error: err?.message || "Error obteniendo sala" });
    }
  });
  apiRouter.post("/rooms/:code/entry", async (req, res) => {
    try {
      const roomCode = String(req.params.code || "").trim().toUpperCase();
      const { playerName, score, formationName, rankingTier } = req.body || {};
      const result = await addFriendRoomEntry({
        roomCode,
        playerName,
        score,
        formationName,
        rankingTier
      });
      if (!result.success) {
        return res.status(400).json(result);
      }
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, error: err?.message || "Error registrando partida en sala" });
    }
  });
  apiRouter.delete("/rooms/:code", async (req, res) => {
    try {
      const roomCode = String(req.params.code || "").trim().toUpperCase();
      const result = await deleteFriendRoom(roomCode);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, error: err?.message || "Error eliminando sala" });
    }
  });
  apiRouter.post("/stats", async (req, res) => {
    try {
      const { mode, username, score, formationName, runCode, deviceInfo } = req.body || {};
      const userAgent = req.headers["user-agent"] || deviceInfo && deviceInfo.userAgent || "";
      const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "";
      const result = await saveGameStat({
        mode,
        username,
        score,
        formationName,
        runCode,
        deviceInfo: {
          ...deviceInfo || {},
          serverUserAgent: userAgent
        },
        userAgent,
        ip
      });
      res.json(result);
    } catch (err) {
      res.json({ success: false, error: err?.message || "Error guardando estad\xEDstica" });
    }
  });
  apiRouter.get("/stats", async (_req, res) => {
    try {
      const stats = await getGameStats(50);
      res.json({ success: true, stats });
    } catch (err) {
      res.json({ success: false, stats: [] });
    }
  });
  app2.use("/api", apiRouter);
  app2.use("/", apiRouter);
  return app2;
}
var app = createExpressApp();

// server-entry.ts
function handler(req, res) {
  return app(req, res);
}
export {
  app,
  handler as default
};
