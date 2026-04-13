import Link from 'next/link';
import { Shield, Lock, Eye, FileText, CheckCircle2, ChevronLeft } from 'lucide-react';

export default function PoliticaPrivacidade() {
    return (
        <div className="bg-slate-50 min-h-screen pb-20">
            {/* Header / Intro */}
            <header className="bg-[#1B263B] text-white pt-32 pb-20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#10b981]/10 blur-[120px] -z-0" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 blur-[100px] -z-0" />
                
                <div className="max-w-4xl mx-auto px-6 relative z-10">
                    <Link href="/" className="inline-flex items-center gap-2 text-[#10b981] font-black text-xs uppercase tracking-widest mb-8 hover:-translate-x-2 transition-transform">
                        <ChevronLeft className="h-4 w-4" /> Voltar ao Portal
                    </Link>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-6 uppercase italic">Política de <span className="text-[#10b981]">Privacidade</span></h1>
                    <p className="text-slate-300 font-medium text-lg leading-relaxed max-w-2xl">
                        Sua segurança é nossa prioridade. Entenda como a Kátia e Flávio Imóveis protege e utiliza seus dados em total conformidade com a LGPD.
                    </p>
                </div>
            </header>

            {/* Content Body */}
            <main className="max-w-4xl mx-auto px-6 -mt-10 relative z-20">
                <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 p-8 md:p-16 space-y-16">
                    
                    {/* Section 1: Intro */}
                    <section className="space-y-6">
                        <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                            <Shield className="h-6 w-6 text-indigo-600" />
                        </div>
                        <h2 className="text-2xl font-black text-[#1B263B] uppercase tracking-tight">1. Compromisso com a Transparência</h2>
                        <div className="prose prose-slate max-w-none text-slate-600 font-medium leading-relaxed">
                            <p>
                                A imobiliária <strong>Kátia e Flávio Imóveis</strong>, pessoa jurídica inscrita sob o CNPJ 00.000.000/0000-00, com sede em Praia Grande/SP, tem o compromisso de proteger a privacidade e os dados pessoais de seus clientes, parceiros e usuários do portal.
                            </p>
                            <p>
                                Esta política detalha como coletamos, usamos, armazenamos e protegemos suas informações quando você utiliza nosso site e serviços, seguindo rigorosamente a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 - LGPD).
                            </p>
                        </div>
                    </section>

                    {/* Section 2: Data types */}
                    <section className="space-y-6">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                            <FileText className="h-6 w-6 text-emerald-600" />
                        </div>
                        <h2 className="text-2xl font-black text-[#1B263B] uppercase tracking-tight">2. Quais dados coletamos?</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                <h4 className="font-black text-[#1B263B] mb-3 uppercase text-xs tracking-widest">Identificação</h4>
                                <ul className="text-slate-500 text-sm space-y-2 font-bold">
                                    <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-[#10b981]" /> Nome completo</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-[#10b981]" /> E-mail</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-[#10b981]" /> Telefone (WhatsApp)</li>
                                </ul>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                <h4 className="font-black text-[#1B263B] mb-3 uppercase text-xs tracking-widest">Navegação</h4>
                                <ul className="text-slate-500 text-sm space-y-2 font-bold">
                                    <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-[#10b981]" /> Endereço IP</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-[#10b981]" /> Histórico de imóveis vistos</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-[#10b981]" /> Preferências de busca</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Section 3: Finalidade */}
                    <section className="space-y-6">
                        <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center">
                            <Eye className="h-6 w-6 text-amber-600" />
                        </div>
                        <h2 className="text-2xl font-black text-[#1B263B] uppercase tracking-tight">3. Para que usamos seus dados?</h2>
                        <div className="prose prose-slate max-w-none text-slate-600 font-medium leading-relaxed">
                            <p>Utilizamos suas informações para fins legítimos de intermediação imobiliária, incluindo:</p>
                            <ul>
                                <li><strong>Atendimento Customizado:</strong> Responder suas dúvidas sobre imóveis específicos;</li>
                                <li><strong>Formalização:</strong> Elaborar fichas de visita e propostas de compra/aluguel;</li>
                                <li><strong>Comunicação:</strong> Enviar oportunidades exclusivas via WhatsApp ou e-mail (apenas com seu consentimento);</li>
                                <li><strong>Segurança:</strong> Garantir que as visitas aos imóveis registrados ocorram de forma segura para proprietários e visitantes.</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 4: Seus Direitos */}
                    <section className="bg-indigo-600 p-10 rounded-[40px] text-white">
                        <div className="flex items-start gap-6">
                            <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center shadow-inner shrink-0">
                                <Lock className="h-7 w-7 text-white" />
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-2xl font-black uppercase tracking-tight">4. Seus Direitos Garantidos</h2>
                                <p className="text-indigo-100 font-medium">Você é o dono dos seus dados. A qualquer momento você pode:</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                                    <div className="bg-white/10 p-4 rounded-2xl text-[12px] font-black uppercase tracking-widest">Acessar seus dados</div>
                                    <div className="bg-white/10 p-4 rounded-2xl text-[12px] font-black uppercase tracking-widest">Corrigir informações</div>
                                    <div className="bg-white/10 p-4 rounded-2xl text-[12px] font-black uppercase tracking-widest">Excluir prontuário</div>
                                    <div className="bg-white/10 p-4 rounded-2xl text-[12px] font-black uppercase tracking-widest">Revogar consentimento</div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Footer Policy */}
                    <div className="pt-12 border-t border-slate-100 text-center">
                        <p className="text-slate-400 text-xs font-black uppercase tracking-[0.3em]">Última Atualização: 01 de Abril de 2026</p>
                        <p className="text-slate-400 text-xs font-bold mt-2 italic">Dúvidas sobre privacidade? <span className="text-[#10b981]">atendimento@katiaeflavioimoveis.com.br</span></p>
                    </div>

                </div>
            </main>
        </div>
    );
}
