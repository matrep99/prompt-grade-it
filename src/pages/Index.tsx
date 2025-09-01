import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { GraduationCap, BookOpen, CheckCircle, Clock, BarChart3, Users } from "lucide-react";

const Index = () => {
  const [userType, setUserType] = useState<'docente' | 'studente' | null>(null);
  const [accessCode, setAccessCode] = useState('');

  const handleDocenteLogin = async () => {
    try {
      const { createTest } = await import('@/utils/api');
      const response = await createTest({ title: 'Nuova verifica' });
      
      if (!response?.id) {
        throw new Error('Risposta server non valida: manca l\'ID.');
      }
      
      window.location.assign('/builder/' + response.id);
    } catch (error: any) {
      alert('Errore durante la creazione della verifica: ' + error.message);
    }
  };

  const handleStudenteAccess = () => {
    if (accessCode.trim()) {
      // TODO: Implementer l'accesso studente con codice
      console.log('Accesso studente con codice:', accessCode);
    }
  };

  if (userType === null) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl qg-gradient-primary flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">QuickGrade</h1>
                  <p className="text-sm text-muted-foreground">Verifiche digitali intelligenti</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold text-foreground mb-6">
                Crea, Assegna e Correggi <br />
                <span className="qg-gradient-primary bg-clip-text text-transparent">
                  Verifiche Digitali
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                La piattaforma completa per docenti moderni. Risparmia tempo con la correzione automatica 
                e l'assistenza AI per una valutazione più efficace dei tuoi studenti.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <Card className="qg-card-hover p-8 text-center">
                <div className="w-16 h-16 rounded-xl bg-accent flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-accent-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-3">Costruttore Intelligente</h3>
                <p className="text-muted-foreground">
                  Crea verifiche con domande multiple, vero/falso, risposte brevi e aperte. 
                  Genera domande automaticamente con l'AI.
                </p>
              </Card>

              <Card className="qg-card-hover p-8 text-center">
                <div className="w-16 h-16 rounded-xl bg-success-light flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-3">Correzione Automatica</h3>
                <p className="text-muted-foreground">
                  Correzione istantanea per domande chiuse e assistenza AI per quelle aperte. 
                  Feedback personalizzato per ogni studente.
                </p>
              </Card>

              <Card className="qg-card-hover p-8 text-center">
                <div className="w-16 h-16 rounded-xl bg-warning-light flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-warning" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-3">Analytics Avanzate</h3>
                <p className="text-muted-foreground">
                  Statistiche dettagliate per classe e singoli studenti. 
                  Identifica aree di miglioramento e monitora i progressi.
                </p>
              </Card>
            </div>

            {/* Action Cards */}
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Docente Card */}
              <Card className="qg-card-hover p-8">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 rounded-xl qg-gradient-primary flex items-center justify-center mx-auto mb-4">
                    <GraduationCap className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-card-foreground mb-2">Sono un Docente</h3>
                  <p className="text-muted-foreground">
                    Accedi alla dashboard per creare e gestire le tue verifiche
                  </p>
                </div>
                <div className="space-y-4">
                  <Button 
                    id="create-test-btn"
                    onClick={handleDocenteLogin}
                    className="w-full qg-gradient-primary text-white hover:opacity-90 transition-opacity"
                    size="lg"
                  >
                    Crea nuova verifica
                  </Button>
                  <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>Risparmia ore</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>Gestisci classi</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Studente Card */}
              <Card className="qg-card-hover p-8">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-10 h-10 text-secondary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold text-card-foreground mb-2">Sono uno Studente</h3>
                  <p className="text-muted-foreground">
                    Inserisci il codice ricevuto dal tuo docente per accedere alla verifica
                  </p>
                </div>
                <div className="space-y-4">
                  <Input
                    placeholder="Inserisci il codice verifica (es. ABC123)"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                    className="text-center text-lg font-mono tracking-wider"
                  />
                  <Button 
                    onClick={() => setUserType('studente')}
                    variant="outline"
                    className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    size="lg"
                    disabled={!accessCode.trim()}
                  >
                    Accedi alla Verifica
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border bg-surface/50 py-8">
          <div className="container mx-auto px-4 text-center">
            <p className="text-muted-foreground">
              © 2024 QuickGrade ITA - Piattaforma per verifiche digitali intelligenti
            </p>
          </div>
        </footer>
      </div>
    );
  }

  // Docente Flow
  if (userType === 'docente') {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-surface/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl qg-gradient-primary flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">QuickGrade</h1>
                  <p className="text-sm text-muted-foreground">Dashboard Docente</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setUserType(null)}
              >
                Torna alla Home
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Benvenuto, Professore!</h2>
            <p className="text-muted-foreground">Gestisci le tue verifiche e monitora i progressi degli studenti</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="qg-card-hover p-6">
              <h3 className="text-xl font-semibold mb-3">Crea Nuova Verifica</h3>
              <p className="text-muted-foreground mb-4">
                Inizia a costruire una nuova verifica con il nostro editor intelligente
              </p>
              <Button className="w-full qg-gradient-primary text-white">
                Crea Verifica
              </Button>
            </Card>

            <Card className="qg-card-hover p-6">
              <h3 className="text-xl font-semibold mb-3">Le Mie Verifiche</h3>
              <p className="text-muted-foreground mb-4">
                Visualizza e gestisci tutte le verifiche create
              </p>
              <Button variant="outline" className="w-full">
                Visualizza (0)
              </Button>
            </Card>

            <Card className="qg-card-hover p-6">
              <h3 className="text-xl font-semibold mb-3">Risultati</h3>
              <p className="text-muted-foreground mb-4">
                Analizza i risultati e le statistiche delle tue classi
              </p>
              <Button variant="outline" className="w-full">
                Visualizza Report
              </Button>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Studente Flow
  if (userType === 'studente') {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-surface/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-secondary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">QuickGrade</h1>
                  <p className="text-sm text-muted-foreground">Accesso Studente</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setUserType(null)}
              >
                Torna alla Home
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <Card className="qg-card p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 rounded-xl bg-accent flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-accent-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-card-foreground mb-2">Accesso alla Verifica</h2>
              <p className="text-muted-foreground">
                Codice inserito: <span className="font-mono font-bold">{accessCode}</span>
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  ⚠️ Questa è una demo. Il sistema completo includerà:
                </p>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                  <li>• Validazione del codice verifica</li>
                  <li>• Interfaccia di svolgimento</li>
                  <li>• Timer e salvataggio automatico</li>
                  <li>• Feedback immediato</li>
                </ul>
              </div>
              
              <Button 
                onClick={handleStudenteAccess}
                className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                size="lg"
              >
                Inizia Verifica (Demo)
              </Button>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  return null;
};

export default Index;