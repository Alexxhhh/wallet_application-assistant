from google import genai
from google.genai import types
import os
import json
import database

def chat_with_assistant(user_message):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "YOUR_API_KEY_HERE":
        return "⚠️ Errore: La chiave API di Gemini non è configurata. Inserisci la tua API KEY nel file .env per usare l'assistente."
        
    try:
        client = genai.Client(api_key=api_key)
        
        # Fetch up-to-date expenses for context
        expenses = database.get_all_expenses()
        expenses_str = json.dumps(expenses, indent=2, ensure_ascii=False)
        
        system_instruction = f"""
        Sei un assistente finanziario personale intelligente e amichevole.
        Il tuo compito è aiutare l'utente a gestire le proprie spese mensili.
        Ecco i dati attuali delle spese dell'utente (dall'applicazione) in formato JSON:
        ```json
        {expenses_str}
        ```
        
        Rispondi sempre in lingua italiana in modo conciso ma utile ed empatico. 
        Calcola totali se richiesto, suggerisci risparmi o analizza i dati. 
        Se l'utente non ha spese, incoraggialo ad aggiungerne dal pannello principale.
        Ricorda che l'utente può inserire nuove spese usando il pannello a sinistra, quindi suggerisci questo modo se chiede come fare.
        """
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=user_message,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
            ),
        )
        
        return response.text
    except Exception as e:
        return f"❌ Si è verificato un errore durante la comunicazione con l'assistente: {str(e)}"
