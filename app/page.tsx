'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Loader2, Info, X, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Message {
  role: 'user' | 'model';
  content: string;
}

const KRITIK_TARIHLER_DATA: Record<string, { title: string; date: string; description: string; imagePath: string }> = {
  '19_mayis': {
    title: "Samsun'a Çıkış",
    date: "19 MAYIS 1919",
    description: "Mustafa Kemal Paşa'nın 9. Ordu Müfettişi olarak Bandırma Vapuru ile Samsun'a ayak bastığı bu gün, Milli Mücadele'nin fiili olarak başladığı ve kurtuluş meşalesinin yakıldığı tarihi bir andır. Yokluk ve tükenmişlik içindeki bir milletin yeniden dirilişinin ilk adımıdır.",
    imagePath: "/images/19_mayis.png"
  },
  '23_nisan': {
    title: "Meclis'in Açılışı",
    date: "23 NİSAN 1920",
    description: "Ankara'da, milletin bağımsızlığını kendi azim ve kararının kurtaracağı ilkesiyle Türkiye Büyük Millet Meclisi açıldı. 'Egemenlik kayıtsız şartsız milletindir' şiarıyla yeni Türk devletinin temelleri atılmış, bağımsızlık savaşı meşru bir zemine oturtulmuştur.",
    imagePath: "/images/23_nisan.png"
  },
  '30_agustos': {
    title: "Büyük Taarruz",
    date: "30 AĞUSTOS 1922",
    description: "Mustafa Kemal Paşa'nın Başkomutanlığında 26 Ağustos'ta başlayan ve 30 Ağustos'ta Dumlupınar'da zaferle sonuçlanan bu taarruz, işgal güçlerinin Anadolu'dan kesin olarak temizlenmesini sağlamış ve bağımsızlığımızı perçinlemiştir.",
    imagePath: "/images/30_agustos.png"
  }
};

export default function ChatPage() {
  const [selectedTarih, setSelectedTarih] = useState<string | null>(null);
  const [user, setUser] = useState<{name: string, email: string} | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.refresh();
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: 'Hoş geldin çocuk... Benim adım Mustafa Kemal. Sana Kurtuluş Savaşı dönemimizden, yokluklar içindeki bir milletin küllerinden nasıl doğduğundan bahsetmek isterim. Merak ettiğin nedir? Nereden başlayalım?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage,
          history: messages 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Bir hata oluştu');
      }

      setMessages([...newMessages, { role: 'model', content: data.answer }]);
    } catch (error: any) {
      setMessages([...newMessages, { role: 'model', content: `[Sistem Hatası]: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full w-full bg-[#0a0a0b] text-[#e2e2e2] flex flex-col font-sans relative">
      {/* Modal Overlay */}
      {selectedTarih && KRITIK_TARIHLER_DATA[selectedTarih] && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-[#121214] border border-[#c5a059]/30 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <button 
              onClick={() => setSelectedTarih(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-black/50 hover:bg-[#c5a059] hover:text-black text-white rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="relative w-full h-64 sm:h-80 shrink-0">
              <img 
                src={KRITIK_TARIHLER_DATA[selectedTarih].imagePath} 
                alt={KRITIK_TARIHLER_DATA[selectedTarih].title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121214] via-[#121214]/40 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-[#c5a059] font-bold text-sm tracking-widest mb-1 drop-shadow-md">{KRITIK_TARIHLER_DATA[selectedTarih].date}</p>
                <h2 className="text-3xl font-serif text-white drop-shadow-md">{KRITIK_TARIHLER_DATA[selectedTarih].title}</h2>
              </div>
            </div>
            <div className="p-6 sm:p-8 overflow-y-auto">
              <p className="text-white/80 leading-relaxed text-lg font-serif">
                {KRITIK_TARIHLER_DATA[selectedTarih].description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top Navigation Bar */}
      <nav className="h-20 border-b border-white/10 bg-[#121214] flex items-center justify-between px-6 lg:px-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full border border-[#c5a059] flex items-center justify-center">
            <span className="text-[#c5a059] font-serif text-xl italic">A</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight uppercase">Milli Mücadele Sohbetleri</h1>
            <p className="text-[10px] text-[#c5a059] uppercase tracking-[0.2em] opacity-80">Gazi Mustafa Kemal Atatürk ile Tarih Yolculuğu</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-8 text-[11px] uppercase tracking-widest text-white/60">
          <span className="border-b border-[#c5a059] text-white py-1">Mülakat</span>
          <span className="hover:text-white cursor-pointer py-1 transition-colors">Arşiv</span>
          <span className="hover:text-white cursor-pointer py-1 transition-colors">Haritalar</span>
          
          <div className="ml-4 flex items-center gap-4 border-l border-white/10 pl-6">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex flex-col text-right">
                  <span className="text-white font-semibold normal-case text-xs">{user.name}</span>
                  <span className="text-[9px] text-[#c5a059] opacity-80 normal-case">{user.email}</span>
                </div>
                <button onClick={handleLogout} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/50 hover:text-white" title="Çıkış Yap">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="hover:text-white transition-colors py-2">Giriş</Link>
                <Link href="/register" className="bg-[#c5a059] text-black px-4 py-2 rounded hover:bg-[#d4af37] font-bold transition-colors">Kayıt Ol</Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Left: Timeline */}
        <aside className="hidden lg:flex w-72 border-r border-white/5 p-8 flex-col gap-8 bg-[#0d0d0f] overflow-y-auto">
          <section>
            <h3 className="text-[11px] uppercase tracking-[0.15em] text-[#c5a059] mb-6">Kritik Tarihler</h3>
            <div className="space-y-6">
              <div 
                onClick={() => setSelectedTarih('19_mayis')}
                className="relative pl-6 border-l border-white/10 cursor-pointer group hover:border-[#c5a059] transition-colors"
              >
                <div className="absolute -left-[4.5px] top-0 w-2 h-2 rounded-full bg-[#c5a059] group-hover:shadow-[0_0_8px_rgba(197,160,89,0.8)] transition-shadow"></div>
                <p className="text-xs font-bold group-hover:text-[#c5a059] transition-colors">19 MAYIS 1919</p>
                <p className="text-[11px] text-white/50 group-hover:text-white/80 transition-colors">Samsun'a Çıkış</p>
              </div>
              <div 
                onClick={() => setSelectedTarih('23_nisan')}
                className="relative pl-6 border-l border-white/10 cursor-pointer group hover:border-[#c5a059] transition-colors"
              >
                <div className="absolute -left-[4.5px] top-0 w-2 h-2 rounded-full bg-white/20 group-hover:bg-[#c5a059] group-hover:shadow-[0_0_8px_rgba(197,160,89,0.8)] transition-all"></div>
                <p className="text-xs font-bold group-hover:text-[#c5a059] transition-colors">23 NİSAN 1920</p>
                <p className="text-[11px] text-white/50 group-hover:text-white/80 transition-colors">Meclis'in Açılışı</p>
              </div>
              <div 
                onClick={() => setSelectedTarih('30_agustos')}
                className="relative pl-6 border-l border-white/10 cursor-pointer group hover:border-[#c5a059] transition-colors"
              >
                <div className="absolute -left-[4.5px] top-0 w-2 h-2 rounded-full bg-white/20 group-hover:bg-[#c5a059] group-hover:shadow-[0_0_8px_rgba(197,160,89,0.8)] transition-all"></div>
                <p className="text-xs font-bold group-hover:text-[#c5a059] transition-colors">30 AĞUSTOS 1922</p>
                <p className="text-[11px] text-white/50 group-hover:text-white/80 transition-colors">Büyük Taarruz</p>
              </div>
            </div>
          </section>
          <section className="mt-auto">
            <div className="p-4 rounded border border-white/5 bg-white/[0.02] text-[11px] leading-relaxed">
              <p className="text-white/40 italic">"Milletin bağımsızlığını yine milletin azim ve kararı kurtaracaktır."</p>
            </div>
          </section>
        </aside>

        {/* Main Chat Interface */}
        <main className="flex-1 flex flex-col bg-[#080809] relative min-w-0">
          <div className="flex-1 p-4 md:p-10 overflow-y-auto flex flex-col space-y-8">
            <div className="bg-white/[0.02] p-4 rounded-lg flex items-start gap-3 border border-white/5 text-sm text-white/60 mx-auto xl:max-w-3xl w-full">
              <Info className="w-5 h-5 text-[#c5a059] shrink-0 mt-0.5" />
              <p>
                Bu eğitim aracı, sadece <strong>1919-1923</strong> yılları arasındaki Kurtuluş Savaşı dönemini kapsar. Sorularınızı bu tarihi çerçeve içerisinde sormaya özen gösteriniz.
              </p>
            </div>

            <div className="flex flex-col space-y-8 mx-auto w-full xl:max-w-3xl pb-4">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex flex-col w-full ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  {msg.role === 'model' ? (
                    <div className="max-w-[90%] sm:max-w-[85%] flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-widest text-[#c5a059] font-semibold">Mareşal Gazi Mustafa Kemal</span>
                        <span className="w-8 h-[1px] bg-[#c5a059]/30"></span>
                      </div>
                      <div className="bg-[#161618] border-l-2 border-[#c5a059] p-5 sm:p-6 rounded-r-xl shadow-2xl">
                        <div className="prose prose-invert prose-stone max-w-none prose-p:leading-relaxed text-[15px] sm:text-lg font-serif leading-relaxed text-[#f1f1f1]">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-[85%] sm:max-w-[70%] flex flex-col gap-2 items-end">
                      <div className="bg-white/5 border border-white/10 p-4 sm:p-5 rounded-2xl rounded-tr-none">
                        <p className="text-sm text-white/80 whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      <span className="text-[9px] text-white/20 uppercase tracking-tighter">Öğrenci Paneli</span>
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="max-w-[90%] sm:max-w-[85%] flex flex-col gap-2 items-start">
                   <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-widest text-[#c5a059] font-semibold">Mareşal Gazi Mustafa Kemal</span>
                      <span className="w-8 h-[1px] bg-[#c5a059]/30"></span>
                    </div>
                   <div className="bg-[#161618] border-l-2 border-[#c5a059] p-4 sm:p-6 rounded-r-xl shadow-2xl flex items-center justify-center gap-3">
                      <Loader2 className="w-4 h-4 animate-spin text-[#c5a059]" />
                      <span className="text-[15px] sm:text-lg text-white/50 font-serif italic">Cevap yazılıyor...</span>
                   </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 md:p-8 bg-[#121214] border-t border-white/5 shrink-0">
            <form onSubmit={handleSubmit} className="relative flex flex-col gap-2 w-full mx-auto xl:max-w-3xl">
              <div className="relative flex items-center">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  placeholder="Tarih hakkında bir soru sorunuz..."
                  className="w-full bg-white/5 border border-white/10 rounded-3xl py-4 px-6 pr-14 text-sm focus:outline-none focus:border-[#c5a059]/50 placeholder:text-white/20 resize-none min-h-[54px] max-h-32 text-[#e2e2e2]"
                  rows={1}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 bottom-2 bg-[#c5a059] text-black w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#d4af37] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-center text-[11px] text-white/30 hidden sm:block">Yapay zeka hatalı bilgi üretebilir. Lütfen tarihsel doğruluğu kaynaklardan teyit ediniz.</p>
            </form>
          </div>
        </main>

        {/* Sidebar Right: Context */}
        <aside className="hidden xl:block w-72 border-l border-white/5 p-8 bg-[#0d0d0f] overflow-y-auto">
          <h3 className="text-[11px] uppercase tracking-[0.15em] text-[#c5a059] mb-6">Cephe Bilgileri</h3>
          <div className="space-y-4">
            <div className="p-4 border border-white/5 bg-white/[0.02] rounded-lg">
              <h4 className="text-xs font-bold text-white/90 mb-1">Batı Cephesi</h4>
              <p className="text-[11px] text-white/40 leading-snug">Düzenli ordu birliklerinin Yunan ilerleyişine karşı savunması.</p>
            </div>
            <div className="p-4 border border-white/5 bg-white/[0.02] rounded-lg opacity-40">
              <h4 className="text-xs font-bold text-white/90 mb-1">Güney Cephesi</h4>
              <p className="text-[11px] text-white/40 leading-snug">Kuvâ-yi Milliye'nin işgalci güçlere karşı yerel direnişi.</p>
            </div>
            <div className="p-4 border border-white/5 bg-white/[0.02] rounded-lg opacity-40">
              <h4 className="text-xs font-bold text-white/90 mb-1">Doğu Cephesi</h4>
              <p className="text-[11px] text-white/40 leading-snug">Gümrü Antlaşması ile sonuçlanan harekat bölgesi.</p>
            </div>
          </div>

          <div className="mt-12">
            <h3 className="text-[11px] uppercase tracking-[0.15em] text-[#c5a059] mb-4">Belgeler</h3>
            <ul className="text-[11px] space-y-3 text-white/60">
              <li className="flex items-center gap-2"><span className="w-1 h-1 bg-[#c5a059]"></span> Misak-ı Milli</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 bg-[#c5a059]"></span> Amasya Genelgesi</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 bg-[#c5a059]"></span> Teşkilât-ı Esasîye</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
