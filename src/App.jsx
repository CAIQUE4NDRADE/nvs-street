import React, { useState, useEffect } from 'react';
import {
  Menu, X, MessageCircle, Instagram, Search,
  Plus, Pencil, Trash2, LayoutGrid, Users, ClipboardList, Wallet,
  LayoutDashboard, ArrowLeft, Lock, AlertTriangle,
  LogOut, Eye, EyeOff, Loader2, ChevronRight, ShoppingBag, Truck, CreditCard,
  Minus, RefreshCw, Percent, Heart
} from 'lucide-react';
import * as api from './lib/api';
import { supabase } from './lib/supabase';
import './App.css';

const WHATS = '5519993160867';
const waLink = (msg) => `https://wa.me/${WHATS}?text=${encodeURIComponent(msg)}`;
const WA_MSG_GERAL = 'Oi! Vim pelo site da NVS e queria dar uma olhada nas peças disponíveis 👀';
const CATEGORIAS = ['Camisetas', 'Moletons', 'Jaquetas', 'Calças', 'Bonés', 'Acessórios'];
const TAMANHOS = ['PP', 'P', 'M', 'G', 'GG'];
const STATUS_LIST = ['Disponível', 'Baixo estoque', 'Esgotado'];
const STATUS_STYLE = {
  'Disponível': { text: '#8fd6ab', dot: '#8fd6ab', bg: 'rgba(143,214,171,0.12)' },
  'Baixo estoque': { text: '#ffcf5c', dot: '#ffcf5c', bg: 'rgba(255,207,92,0.12)' },
  'Esgotado': { text: '#ff8a80', dot: '#E5231B', bg: 'rgba(229,35,27,0.12)' },
};
const PEDIDO_STATUS_STYLE = {
  'Pendente': { text: '#ffcf5c', dot: '#ffcf5c', bg: 'rgba(255,207,92,0.12)' },
  'Pago': { text: '#8fd6ab', dot: '#8fd6ab', bg: 'rgba(143,214,171,0.12)' },
  'Enviado': { text: '#7ecbff', dot: '#7ecbff', bg: 'rgba(126,203,255,0.12)' },
  'Concluído': { text: 'rgba(245,245,240,0.55)', dot: 'rgba(245,245,240,0.4)', bg: 'rgba(245,245,240,0.06)' },
  'Cancelado': { text: '#ff8a80', dot: '#E5231B', bg: 'rgba(229,35,27,0.12)' },
};
const PEDIDO_STATUS_LIST = ['Pendente', 'Pago', 'Enviado', 'Concluído', 'Cancelado'];

const SEED_PRODUTOS = [
  { id: 1, codigo: 'NVS001', nome: 'Camiseta Oversized Logo', categoria: 'Camisetas', cor: 'Preto', tamanho: 'M', preco: 89, estoque: 12, status: 'Disponível' },
  { id: 2, codigo: 'NVS002', nome: 'Moletom Canguru Est.', categoria: 'Moletons', cor: 'Cinza', tamanho: 'G', preco: 179, estoque: 5, status: 'Disponível' },
  { id: 3, codigo: 'NVS003', nome: 'Jaqueta Corta-Vento', categoria: 'Jaquetas', cor: 'Verde Militar', tamanho: 'M', preco: 249, estoque: 0, status: 'Esgotado' },
  { id: 4, codigo: 'NVS004', nome: 'Boné Aba Reta NVS', categoria: 'Bonés', cor: 'Preto', tamanho: 'Único', preco: 69, estoque: 20, status: 'Disponível' },
];
const SEED_CLIENTES = [
  { id: 1, nome: 'Pedro Lima', telefone: '(19) 99999-0001' },
  { id: 2, nome: 'Rafael Souza', telefone: '(19) 99999-0002' },
];
const SEED_PEDIDOS = [];

const brl = (n) => (Number(n) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');
const installmentText = (preco) => `6x de ${brl((Number(preco) || 0) / 6)}`;
const BRANDS = [
  { nome: 'Lacoste', variant: 'condensed' },
  { nome: 'Casablanca', variant: 'serif' },
  { nome: 'Tommy Hilfiger', variant: 'flagblock' },
  { nome: 'Hugo Boss', variant: 'plain' },
  { nome: 'Nike', variant: 'italicwide' },
];
const CATEGORY_TILES = ['Camisetas', 'Moletons', 'Bermudas', 'Calças', 'Bonés', 'Acessórios'];
const LIFESTYLE_LOOKS = [
  { id: 1, label: 'Look urbano · concreto' },
  { id: 2, label: 'Look urbano · orla' },
  { id: 3, label: 'Look urbano · cidade' },
  { id: 4, label: 'Look urbano · noite' },
];
const fmtDate = (s) => { if (!s) return '—'; const [y, m, d] = s.split('-'); return `${d}/${m}/${y}`; };
const nextCodigo = (list) => {
  const nums = list.map(v => parseInt((v.codigo || '').replace('NVS', ''), 10)).filter(n => !isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return 'NVS' + String(max + 1).padStart(3, '0');
};

function StatusTag({ status, map = STATUS_STYLE }) {
  const s = map[status] || { text: 'var(--text)', dot: 'var(--red)', bg: 'rgba(255,255,255,0.06)' };
  return (
    <span className="nv-status-tag" style={{ background: s.bg, color: s.text }}>
      <span className="nv-status-dot" style={{ background: s.dot }} /> {status}
    </span>
  );
}

function Field({ label, children }) {
  return <label className="nv-field" style={{ display: 'block' }}><span className="nv-label">{label}</span>{children}</label>;
}

// ---------- PhotoSlot: mostra a foto real quando existir; senão, um
// placeholder elegante (nunca inventa produto/foto falsa). ----------
function PhotoSlot({ src, alt = '', label = '', tone = 'dark', className = '', loading = 'lazy' }) {
  const [broken, setBroken] = useState(false);
  const showImg = src && !broken;
  return (
    <div className={`nv-photoslot ${tone === 'light' ? 'light' : ''} ${className}`}>
      {showImg ? (
        <img src={src} alt={alt} loading={loading} onError={() => setBroken(true)} />
      ) : (
        <span className="placeholder-label">{label}</span>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="nv-modal-overlay" onClick={onClose}>
      <div className="nv-modal" onClick={e => e.stopPropagation()}>
        <div className="nv-modal-head">
          <h3>{title}</h3>
          <button className="nv-icon-btn" onClick={onClose}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ---------- LOGIN (mesmo padrão do Dyna Festas / Milê) ----------
function LoginScreen({ onLogin, onVoltar, error, loading, offline, onDemoAccess }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [verSenha, setVerSenha] = useState(false);
  const submit = (e) => { e.preventDefault(); if (email && senha) onLogin(email, senha); };
  return (
    <div className="nv-wrap">
      <button className="nv-btn-ghost" onClick={onVoltar} style={{ marginTop: 32 }}><ArrowLeft size={14} /> Voltar ao site</button>
      <div className="nv-login-box">
        <div className="icon-wrap"><Lock size={20} /></div>
        <h2 style={{ fontSize: '1.3rem', marginBottom: 6 }}>Área da loja</h2>
        <p style={{ opacity: 0.6, fontSize: '0.85rem', marginBottom: 20, textTransform: 'none', fontFamily: 'Inter' }}>Entre com sua conta para acessar o painel administrativo.</p>

        {offline && (
          <div className="nv-warning">
            <AlertTriangle size={14} style={{ marginTop: 2, flexShrink: 0 }} />
            <span style={{ textTransform: 'none' }}>Supabase não configurado neste ambiente — o login real está desativado. Configure o .env (veja README.md).</span>
          </div>
        )}
        {offline && (
          <button type="button" onClick={onDemoAccess} className="nv-btn-ghost" style={{ width: '100%', justifyContent: 'center', marginBottom: 18 }}>
            Continuar em modo demonstração
          </button>
        )}

        <form onSubmit={submit}>
          <Field label="E-mail">
            <input className="nv-input" type="email" required autoFocus disabled={offline} value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@nvsstreet.com" />
          </Field>
          <Field label="Senha">
            <div className="nv-input-wrap">
              <input className="nv-input" style={{ paddingRight: 40 }} type={verSenha ? 'text' : 'password'} required disabled={offline} value={senha} onChange={e => setSenha(e.target.value)} placeholder="••••••••" />
              <button type="button" className="nv-input-eye" onClick={() => setVerSenha(!verSenha)}>{verSenha ? <EyeOff size={15} /> : <Eye size={15} />}</button>
            </div>
          </Field>
          {error && <div className="nv-error" style={{ textTransform: 'none' }}><AlertTriangle size={13} /> {error}</div>}
          <button type="submit" disabled={loading || offline} className="nv-btn nv-btn-red" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
            {loading ? <><Loader2 size={15} style={{ animation: 'nvspin 1s linear infinite' }} /> Entrando...</> : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

function AdminSidebarContent({ adminTab, setAdminTab, setView, onLogout, email, onNavigate }) {
  const items = [
    ['dashboard', 'Dashboard', LayoutDashboard],
    ['produtos', 'Produtos', LayoutGrid],
    ['clientes', 'Clientes', Users],
    ['pedidos', 'Pedidos', ClipboardList],
    ['financeiro', 'Financeiro', Wallet],
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="nv-sidebar-brand">
        <div className="name">NVS Street</div>
        <div className="sub">Painel administrativo</div>
        {email && <div className="nv-sidebar-email" title={email}>{email}</div>}
      </div>
      <nav className="nv-sidebar-nav">
        {items.map(([key, label, Icon]) => (
          <button key={key} className={`nv-sidebar-item ${adminTab === key ? 'active' : ''}`} onClick={() => { setAdminTab(key); onNavigate && onNavigate(); }}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </nav>
      <div className="nv-sidebar-footer">
        <button className="nv-sidebar-item" onClick={() => setView('site')}><ArrowLeft size={16} /> Voltar ao site</button>
        {onLogout && <button className="nv-sidebar-item" style={{ color: '#ff8a80' }} onClick={onLogout}><LogOut size={16} /> Sair</button>}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return <div className="nv-stat-card"><div className="label">{label}</div><div className="value" style={{ color: accent }}>{value}</div></div>;
}

function Dashboard({ counts, receitaMes, pedidosPendentes, clienteNome, produtoNome }) {
  return (
    <div>
      <h1 style={{ fontSize: '1.6rem', marginBottom: 22 }}>Dashboard</h1>
      <div className="nv-stat-grid">
        {STATUS_LIST.map(s => <StatCard key={s} label={s} value={counts[s] || 0} accent={STATUS_STYLE[s].text} />)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="nv-panel">
          <div style={{ fontSize: '0.7rem', opacity: 0.5, textTransform: 'uppercase' }}>Receita do mês</div>
          <div style={{ fontFamily: 'Anton, sans-serif', fontSize: '1.7rem', marginTop: 6 }}>{brl(receitaMes)}</div>
        </div>
        <div className="nv-panel">
          <div style={{ fontSize: '0.7rem', opacity: 0.5, marginBottom: 10, textTransform: 'uppercase' }}>Pedidos pendentes</div>
          {pedidosPendentes.length === 0 && <p style={{ fontSize: '0.85rem', opacity: 0.5, textTransform: 'none' }}>Nenhum pedido pendente.</p>}
          {pedidosPendentes.map(p => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '5px 0', textTransform: 'none' }}>
              <span>{produtoNome(p.produtoId)} · {clienteNome(p.clienteId)}</span>
              <span style={{ opacity: 0.6 }}>{fmtDate(p.dataPedido)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProdutosPanel({ produtos, pedidos, onNew, onEdit, onDelete }) {
  const numVendas = (id) => pedidos.filter(p => Number(p.produtoId) === Number(id)).length;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <h1 style={{ fontSize: '1.6rem' }}>Produtos</h1>
        <button className="nv-btn nv-btn-red" onClick={onNew}><Plus size={15} /> Novo produto</button>
      </div>
      <p style={{ fontSize: '0.8rem', opacity: 0.5, margin: '0 0 16px', textTransform: 'none' }}>{produtos.length} produto(s) cadastrado(s)</p>
      <div className="nv-panel" style={{ overflowX: 'auto' }}>
        <table className="nv-table">
          <thead><tr><th>Código</th><th>Nome</th><th>Marca</th><th>Categoria</th><th>Cor</th><th>Tam.</th><th>Preço</th><th>Estoque</th><th>Vendas</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {produtos.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: 600 }}>{p.codigo}</td>
                <td>{p.nome}</td>
                <td>{p.marca || '—'}</td>
                <td>{p.categoria}</td>
                <td>{p.cor}</td>
                <td>{p.tamanho}</td>
                <td>{brl(p.preco)}</td>
                <td>{p.estoque}</td>
                <td>{numVendas(p.id)}</td>
                <td><StatusTag status={p.status} /></td>
                <td style={{ display: 'flex', gap: 4 }}>
                  <button className="nv-icon-btn" onClick={() => onEdit(p)}><Pencil size={14} /></button>
                  <button className="nv-icon-btn" style={{ color: '#ff8a80' }} onClick={() => onDelete(p.id)}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {produtos.length === 0 && <div className="nv-empty">Nenhum produto cadastrado ainda.</div>}
      </div>
    </div>
  );
}

function ClientesPanel({ clientes, pedidos, onNew, onEdit, onDelete }) {
  const numPedidos = (id) => pedidos.filter(p => Number(p.clienteId) === Number(id)).length;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <h1 style={{ fontSize: '1.6rem' }}>Clientes</h1>
        <button className="nv-btn nv-btn-red" onClick={onNew}><Plus size={15} /> Novo cliente</button>
      </div>
      <p style={{ fontSize: '0.8rem', opacity: 0.5, margin: '0 0 16px', textTransform: 'none' }}>{clientes.length} cliente(s) cadastrado(s)</p>
      <div className="nv-panel" style={{ overflowX: 'auto' }}>
        <table className="nv-table">
          <thead><tr><th>Nome</th><th>Telefone</th><th>Instagram</th><th>Pedidos</th><th></th></tr></thead>
          <tbody>
            {clientes.map(c => (
              <tr key={c.id}>
                <td>{c.nome}</td><td>{c.telefone || '—'}</td><td>{c.instagram || '—'}</td><td>{numPedidos(c.id)}</td>
                <td style={{ display: 'flex', gap: 4 }}>
                  <button className="nv-icon-btn" onClick={() => onEdit(c)}><Pencil size={14} /></button>
                  <button className="nv-icon-btn" style={{ color: '#ff8a80' }} onClick={() => onDelete(c.id)}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {clientes.length === 0 && <div className="nv-empty">Nenhum cliente cadastrado ainda.</div>}
      </div>
    </div>
  );
}

function PedidosPanel({ pedidos, clienteNome, produtoNome, onNew, onAvancar, onCancelar }) {
  const proximoStatus = { 'Pendente': 'Pago', 'Pago': 'Enviado', 'Enviado': 'Concluído' };
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <h1 style={{ fontSize: '1.6rem' }}>Pedidos</h1>
        <button className="nv-btn nv-btn-red" onClick={onNew}><Plus size={15} /> Novo pedido</button>
      </div>
      <div className="nv-panel" style={{ overflowX: 'auto', marginTop: 16 }}>
        <table className="nv-table">
          <thead><tr><th>Cliente</th><th>Produto</th><th>Qtd.</th><th>Data</th><th>Valor</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {pedidos.map(p => (
              <tr key={p.id}>
                <td>{clienteNome(p.clienteId)}</td>
                <td>{produtoNome(p.produtoId)}</td>
                <td>{p.quantidade}</td>
                <td>{fmtDate(p.dataPedido)}</td>
                <td>{brl(p.valor)}</td>
                <td><StatusTag status={p.status} map={PEDIDO_STATUS_STYLE} /></td>
                <td style={{ display: 'flex', gap: 4 }}>
                  {proximoStatus[p.status] && <button className="nv-btn-ghost nv-btn-sm" onClick={() => onAvancar(p, proximoStatus[p.status])}>Marcar {proximoStatus[p.status]}</button>}
                  {(p.status === 'Pendente' || p.status === 'Pago') && <button className="nv-icon-btn" style={{ color: '#ff8a80' }} title="Cancelar pedido" onClick={() => onCancelar(p)}><X size={14} /></button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pedidos.length === 0 && <div className="nv-empty">Nenhum pedido registrado ainda.</div>}
      </div>
    </div>
  );
}

function FinanceiroPanel({ pedidos, despesas, onNovaDespesa, onDeleteDespesa }) {
  const receitaTotal = pedidos.filter(p => p.status !== 'Cancelado').reduce((s, p) => s + Number(p.valor || 0), 0);
  const despesaTotal = despesas.reduce((s, d) => s + Number(d.valor || 0), 0);
  return (
    <div>
      <h1 style={{ fontSize: '1.6rem', marginBottom: 22 }}>Financeiro</h1>
      <div className="nv-stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))' }}>
        <StatCard label="Receita total (pedidos)" value={brl(receitaTotal)} accent="#8fd6ab" />
        <StatCard label="Despesas totais" value={brl(despesaTotal)} accent="#ff8a80" />
        <StatCard label="Saldo" value={brl(receitaTotal - despesaTotal)} accent="#ffcf5c" />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <h3 style={{ fontSize: '0.95rem' }}>Despesas</h3>
        <button className="nv-btn nv-btn-red" onClick={onNovaDespesa}><Plus size={14} /> Nova despesa</button>
      </div>
      <div className="nv-panel" style={{ overflowX: 'auto' }}>
        <table className="nv-table">
          <thead><tr><th>Descrição</th><th>Categoria</th><th>Valor</th><th>Data</th><th></th></tr></thead>
          <tbody>
            {despesas.map(d => (
              <tr key={d.id}>
                <td>{d.descricao}</td><td>{d.categoria || '—'}</td><td>{brl(d.valor)}</td><td>{fmtDate(d.data)}</td>
                <td><button className="nv-icon-btn" style={{ color: '#ff8a80' }} onClick={() => onDeleteDespesa(d.id)}><Trash2 size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {despesas.length === 0 && <div className="nv-empty">Nenhuma despesa registrada ainda.</div>}
      </div>
    </div>
  );
}

function ProdutoForm({ data, onSave, onClose, offline }) {
  const [f, setF] = useState({
    nome: '', categoria: CATEGORIAS[0], cor: '', tamanho: TAMANHOS[0], marca: '', imagemUrl: '',
    preco: '', precoAntigo: '', custo: '', estoque: '', status: 'Disponível', fornecedor: '', observacoes: '',
    ...data,
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadError('');
    if (offline) { setUploadError('Conecte o Supabase para enviar fotos (veja README).'); return; }
    // Prévia imediata enquanto sobe o arquivo
    setF(prev => ({ ...prev, imagemUrl: URL.createObjectURL(file) }));
    setUploading(true);
    try {
      const ext = file.name.split('.').pop().toLowerCase();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage.from('produtos').upload(fileName, file, { upsert: false });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from('produtos').getPublicUrl(fileName);
      setF(prev => ({ ...prev, imagemUrl: pub.publicUrl }));
    } catch (err) {
      console.error(err);
      setUploadError('Não foi possível enviar a foto. Rode supabase/migracao-storage-produtos.sql (veja README) e tente de novo.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal title={data.id ? 'Editar produto' : 'Novo produto'} onClose={onClose}>
      <div className="nv-form-grid">
        <Field label="Nome *"><input className="nv-input" value={f.nome} onChange={set('nome')} /></Field>
        <Field label="Marca"><input className="nv-input" value={f.marca} onChange={set('marca')} placeholder="ex: Lacoste" /></Field>
      </div>

      <Field label="Foto do produto">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ height: 80, width: 80, flex: 'none' }}>
            <PhotoSlot tone="light" src={f.imagemUrl} label="sem foto" />
          </div>
          <div style={{ flex: 1 }}>
            <label className="nv-btn-ghost nv-btn-sm" style={{ cursor: uploading ? 'wait' : 'pointer', display: 'inline-flex' }}>
              {uploading ? <><Loader2 size={13} style={{ animation: 'nvspin 1s linear infinite' }} /> Enviando...</> : 'Escolher arquivo do computador'}
              <input type="file" accept="image/*" onChange={handleFile} disabled={uploading} style={{ display: 'none' }} />
            </label>
            {uploadError && <div className="nv-error" style={{ marginTop: 8, textTransform: 'none' }}><AlertTriangle size={13} /> {uploadError}</div>}
          </div>
        </div>
      </Field>

      <div className="nv-form-grid">
        <Field label="Categoria"><select className="nv-select" value={f.categoria} onChange={set('categoria')}>{CATEGORIAS.map(c => <option key={c}>{c}</option>)}</select></Field>
        <Field label="Tamanho"><select className="nv-select" value={f.tamanho} onChange={set('tamanho')}>{TAMANHOS.map(t => <option key={t}>{t}</option>)}<option value="Único">Único</option></select></Field>
      </div>
      <div className="nv-form-grid">
        <Field label="Cor"><input className="nv-input" value={f.cor} onChange={set('cor')} placeholder="ex: Preto" /></Field>
        <Field label="Fornecedor"><input className="nv-input" value={f.fornecedor} onChange={set('fornecedor')} /></Field>
      </div>
      <div className="nv-form-grid">
        <Field label="Preço de venda (R$)"><input className="nv-input" type="number" value={f.preco} onChange={set('preco')} /></Field>
        <Field label="Preço antigo — se houver desconto (R$)"><input className="nv-input" type="number" value={f.precoAntigo} onChange={set('precoAntigo')} placeholder="deixe vazio se não tiver desconto" /></Field>
      </div>
      <div className="nv-form-grid">
        <Field label="Custo (R$)"><input className="nv-input" type="number" value={f.custo} onChange={set('custo')} /></Field>
        <Field label="Estoque (unidades)"><input className="nv-input" type="number" value={f.estoque} onChange={set('estoque')} /></Field>
      </div>
      <Field label="Status"><select className="nv-select" value={f.status} onChange={set('status')}>{STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}</select></Field>
      <Field label="Observações"><textarea className="nv-textarea" rows={2} value={f.observacoes} onChange={set('observacoes')} /></Field>
      <button className="nv-btn nv-btn-red" disabled={uploading} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} onClick={() => f.nome && onSave(f)}>{uploading ? 'Aguarde o envio da foto...' : 'Salvar'}</button>
    </Modal>
  );
}

function ClienteForm({ data, onSave, onClose }) {
  const [f, setF] = useState({ nome: '', telefone: '', whatsapp: '', instagram: '', email: '', endereco: '', observacoes: '', ...data });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <Modal title={data.id ? 'Editar cliente' : 'Novo cliente'} onClose={onClose}>
      <Field label="Nome *"><input className="nv-input" value={f.nome} onChange={set('nome')} /></Field>
      <div className="nv-form-grid">
        <Field label="Telefone"><input className="nv-input" value={f.telefone} onChange={set('telefone')} /></Field>
        <Field label="WhatsApp"><input className="nv-input" value={f.whatsapp} onChange={set('whatsapp')} placeholder="se diferente do telefone" /></Field>
      </div>
      <div className="nv-form-grid">
        <Field label="Instagram"><input className="nv-input" value={f.instagram} onChange={set('instagram')} placeholder="@usuario" /></Field>
        <Field label="E-mail"><input className="nv-input" type="email" value={f.email} onChange={set('email')} /></Field>
      </div>
      <Field label="Endereço"><input className="nv-input" value={f.endereco} onChange={set('endereco')} /></Field>
      <Field label="Observações"><textarea className="nv-textarea" rows={2} value={f.observacoes} onChange={set('observacoes')} /></Field>
      <button className="nv-btn nv-btn-red" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} onClick={() => f.nome && onSave(f)}>Salvar</button>
    </Modal>
  );
}

function PedidoForm({ data, produtos, clientes, onSave, onClose }) {
  const [f, setF] = useState({ clienteId: clientes[0]?.id || '', produtoId: produtos[0]?.id || '', quantidade: 1, dataPedido: '', valor: '', ...data });
  const valid = f.clienteId && f.produtoId && f.dataPedido && f.quantidade;
  return (
    <Modal title="Novo pedido" onClose={onClose}>
      <Field label="Cliente">
        <select className="nv-select" value={f.clienteId} onChange={e => setF({ ...f, clienteId: Number(e.target.value) })}>
          {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
      </Field>
      <Field label="Produto (em estoque)">
        <select className="nv-select" value={f.produtoId} onChange={e => {
          const prod = produtos.find(p => p.id === Number(e.target.value));
          setF({ ...f, produtoId: Number(e.target.value), valor: prod ? prod.preco * f.quantidade : f.valor });
        }}>
          {produtos.length === 0 && <option>Nenhum produto em estoque</option>}
          {produtos.map(p => <option key={p.id} value={p.id}>{p.codigo} · {p.nome} ({p.estoque} un.)</option>)}
        </select>
      </Field>
      <div className="nv-form-grid">
        <Field label="Quantidade"><input className="nv-input" type="number" min="1" value={f.quantidade} onChange={e => setF({ ...f, quantidade: e.target.value })} /></Field>
        <Field label="Data do pedido"><input className="nv-input" type="date" value={f.dataPedido} onChange={e => setF({ ...f, dataPedido: e.target.value })} /></Field>
      </div>
      <Field label="Valor total (R$)"><input className="nv-input" type="number" value={f.valor} onChange={e => setF({ ...f, valor: e.target.value })} /></Field>
      <button className="nv-btn nv-btn-red" disabled={!valid} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} onClick={() => onSave(f)}>Registrar pedido</button>
    </Modal>
  );
}

function DespesaForm({ data, onSave, onClose }) {
  const [f, setF] = useState({ descricao: '', categoria: 'Outros', valor: '', data: '', ...data });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <Modal title="Nova despesa" onClose={onClose}>
      <Field label="Descrição *"><input className="nv-input" value={f.descricao} onChange={set('descricao')} /></Field>
      <div className="nv-form-grid">
        <Field label="Categoria">
          <select className="nv-select" value={f.categoria} onChange={set('categoria')}>
            {['Compra de estoque', 'Frete', 'Marketing', 'Embalagem', 'Aluguel/Contas', 'Outros'].map(c => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Data"><input className="nv-input" type="date" value={f.data} onChange={set('data')} /></Field>
      </div>
      <Field label="Valor (R$) *"><input className="nv-input" type="number" value={f.valor} onChange={set('valor')} /></Field>
      <button className="nv-btn nv-btn-red" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} onClick={() => f.descricao && f.valor && onSave(f)}>Salvar</button>
    </Modal>
  );
}

// ---------- CARRINHO ----------
function CartDrawer({ cart, produtos, onClose, onQty, onRemove, onCheckout }) {
  const items = cart.map(c => ({ ...c, produto: produtos.find(p => p.id === c.produtoId) })).filter(i => i.produto);
  const subtotal = items.reduce((s, i) => s + i.produto.preco * i.qtd, 0);
  return (
    <div className="nv-cart-overlay" onClick={onClose}>
      <div className="nv-cart-drawer" onClick={e => e.stopPropagation()}>
        <div className="nv-cart-head">
          <h3 style={{ fontFamily: 'Anton, sans-serif', fontSize: '1.1rem', textTransform: 'uppercase' }}>Sua sacola</h3>
          <button className="nv-icon-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="nv-cart-items">
          {items.length === 0 && <div className="nv-cart-empty">Sua sacola está vazia.<br />Adicione peças do catálogo.</div>}
          {items.map(i => (
            <div className="nv-cart-item" key={i.produtoId}>
              <div className="swatch"><PhotoSlot tone="light" src={i.produto.imagemUrl} label="" /></div>
              <div className="info">
                <div className="name">{i.produto.nome}</div>
                <div className="meta">{i.produto.tamanho} · {i.produto.cor} · {brl(i.produto.preco)}</div>
                <div className="nv-cart-qty">
                  <button onClick={() => onQty(i.produtoId, i.qtd - 1)}><Minus size={11} /></button>
                  <span style={{ fontSize: '0.82rem' }}>{i.qtd}</span>
                  <button onClick={() => onQty(i.produtoId, i.qtd + 1)} disabled={i.qtd >= i.produto.estoque}><Plus size={11} /></button>
                  <button className="nv-icon-btn" style={{ marginLeft: 'auto', color: '#ff8a80' }} onClick={() => onRemove(i.produtoId)}><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {items.length > 0 && (
          <div className="nv-cart-footer">
            <div className="nv-cart-subtotal"><span>Subtotal</span><span>{brl(subtotal)}</span></div>
            <button className="nv-btn nv-btn-red" style={{ width: '100%', justifyContent: 'center' }} onClick={onCheckout}>
              <MessageCircle size={15} /> Fechar pedido no WhatsApp
            </button>
            <p style={{ fontSize: '0.7rem', opacity: 0.45, marginTop: 10, textAlign: 'center', textTransform: 'none' }}>Pagamento e envio combinados direto na conversa.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function NvsStreetApp() {
  const [view, setView] = useState('site');
  const [adminTab, setAdminTab] = useState('dashboard');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [sidebarMobile, setSidebarMobile] = useState(false);

  const [produtos, setProdutos] = useState(SEED_PRODUTOS);
  const [clientes, setClientes] = useState(SEED_CLIENTES);
  const [pedidos, setPedidos] = useState(SEED_PEDIDOS);
  const [despesas, setDespesas] = useState([]);
  const [offline, setOffline] = useState(false);

  const [session, setSession] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const [filtroTamanho, setFiltroTamanho] = useState('Todos');
  const [busca, setBusca] = useState('');

  const [produtoModal, setProdutoModal] = useState(null);
  const [clienteModal, setClienteModal] = useState(null);
  const [pedidoModal, setPedidoModal] = useState(null);
  const [despesaModal, setDespesaModal] = useState(null);
  const [toast, setToast] = useState(null);

  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const toggleFavorite = (id) => setFavorites(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('nvs_cart');
      if (saved) setCart(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);
  useEffect(() => {
    try { localStorage.setItem('nvs_cart', JSON.stringify(cart)); } catch { /* ignore */ }
  }, [cart]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setAuthChecked(true); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (!newSession) setView('site');
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const p = await api.listProdutos();
        setProdutos(p);
        setOffline(false);
      } catch (e) {
        console.error('Falha ao conectar no Supabase, usando dados de exemplo', e);
        setOffline(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!session) return;
    (async () => {
      try {
        const [c, p, d] = await Promise.all([api.listClientes(), api.listPedidos(), api.listDespesas().catch(() => [])]);
        setClientes(c); setPedidos(p); setDespesas(d);
      } catch (e) { console.error('Falha ao carregar dados administrativos', e); }
    })();
  }, [session]);

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 2400); }

  const fazerLogin = async (email, senha) => {
    setLoginError(''); setLoginLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
      if (error) throw error;
      setView('admin');
    } catch (e) {
      setLoginError(e.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : 'Não foi possível entrar. Tente novamente.');
    } finally { setLoginLoading(false); }
  };
  const fazerLogout = async () => { await supabase.auth.signOut(); setView('site'); };
  const abrirAreaDaLoja = () => { setMobileMenu(false); setView(session ? 'admin' : 'login'); };

  const counts = STATUS_LIST.reduce((acc, s) => { acc[s] = produtos.filter(p => p.status === s).length; return acc; }, {});
  const now = new Date();
  const receitaMes = pedidos.filter(p => { const d = new Date(p.dataPedido); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && p.status !== 'Cancelado'; }).reduce((s, p) => s + Number(p.valor || 0), 0);
  const pedidosPendentes = pedidos.filter(p => p.status === 'Pendente').slice(0, 5);

  const catalogo = produtos.filter(p =>
    (filtroCategoria === 'Todas' || p.categoria === filtroCategoria) &&
    (filtroTamanho === 'Todos' || p.tamanho === filtroTamanho) &&
    (busca === '' || p.nome.toLowerCase().includes(busca.toLowerCase()) || (p.cor || '').toLowerCase().includes(busca.toLowerCase()))
  );

  const clienteNome = (id) => clientes.find(c => c.id === id)?.nome || '—';
  const produtoNome = (id) => produtos.find(p => p.id === id)?.nome || '—';

  // ---- carrinho ----
  const cartCount = cart.reduce((s, i) => s + i.qtd, 0);
  const addToCart = (produto) => {
    if (produto.status === 'Esgotado' || produto.estoque <= 0) return;
    setCart(prev => {
      const existing = prev.find(i => i.produtoId === produto.id);
      if (existing) {
        if (existing.qtd >= produto.estoque) { showToast('Estoque máximo atingido pra essa peça'); return prev; }
        return prev.map(i => i.produtoId === produto.id ? { ...i, qtd: i.qtd + 1 } : i);
      }
      return [...prev, { produtoId: produto.id, qtd: 1 }];
    });
    showToast(`${produto.nome} adicionado à sacola`);
  };
  const setQty = (produtoId, qtd) => {
    const produto = produtos.find(p => p.id === produtoId);
    if (!produto) return;
    if (qtd < 1) { setCart(prev => prev.filter(i => i.produtoId !== produtoId)); return; }
    if (qtd > produto.estoque) return;
    setCart(prev => prev.map(i => i.produtoId === produtoId ? { ...i, qtd } : i));
  };
  const removeFromCart = (produtoId) => setCart(prev => prev.filter(i => i.produtoId !== produtoId));
  const checkoutWhatsapp = () => {
    const items = cart.map(c => ({ ...c, produto: produtos.find(p => p.id === c.produtoId) })).filter(i => i.produto);
    if (items.length === 0) return;
    const linhas = items.map(i => `• ${i.qtd}x ${i.produto.nome} (${i.produto.tamanho}) — ${brl(i.produto.preco * i.qtd)}`);
    const subtotal = items.reduce((s, i) => s + i.produto.preco * i.qtd, 0);
    const msg = `Oi! Quero fechar esse pedido:\n\n${linhas.join('\n')}\n\nTotal: ${brl(subtotal)}`;
    window.open(`https://wa.me/${WHATS}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // ---- CRUD admin ----
  const saveProduto = async (data) => {
    try {
      if (data.id) {
        const atualizado = offline ? data : await api.updateProduto(data);
        setProdutos(produtos.map(p => p.id === data.id ? atualizado : p));
      } else {
        const payload = { ...data, codigo: nextCodigo(produtos) };
        const criado = offline ? { ...payload, id: Date.now() } : await api.createProduto(payload);
        setProdutos([...produtos, criado]);
      }
      setProdutoModal(null); showToast('Produto salvo');
    } catch (e) { console.error(e); showToast('Não foi possível salvar o produto'); }
  };
  const deleteProduto = async (id) => {
    try { if (!offline) await api.deleteProduto(id); setProdutos(produtos.filter(p => p.id !== id)); showToast('Produto removido'); }
    catch (e) { console.error(e); showToast('Não foi possível excluir'); }
  };
  const saveCliente = async (data) => {
    try {
      if (data.id) {
        const atualizado = offline ? data : await api.updateCliente(data);
        setClientes(clientes.map(c => c.id === data.id ? atualizado : c));
      } else {
        const criado = offline ? { ...data, id: Date.now() } : await api.createCliente(data);
        setClientes([...clientes, criado]);
      }
      setClienteModal(null); showToast('Cliente salvo');
    } catch (e) { console.error(e); showToast('Não foi possível salvar o cliente'); }
  };
  const deleteCliente = async (id) => {
    try { if (!offline) await api.deleteCliente(id); setClientes(clientes.filter(c => c.id !== id)); showToast('Cliente removido'); }
    catch (e) { console.error(e); showToast('Não foi possível excluir'); }
  };
  const savePedido = async (data) => {
    try {
      const produto = produtos.find(p => p.id === Number(data.produtoId));
      if (produto && Number(data.quantidade) > produto.estoque) { showToast(`Estoque insuficiente (${produto.estoque} disponível)`); return; }
      const criado = offline ? { ...data, id: Date.now(), status: 'Pendente' } : await api.createPedido(data);
      setPedidos([...pedidos, criado]);
      if (produto) {
        const novoEstoque = produto.estoque - Number(data.quantidade);
        const novoStatus = novoEstoque <= 0 ? 'Esgotado' : novoEstoque <= 3 ? 'Baixo estoque' : 'Disponível';
        if (!offline) await api.updateProdutoEstoque(produto.id, novoEstoque, novoStatus);
        setProdutos(produtos.map(p => p.id === produto.id ? { ...p, estoque: novoEstoque, status: novoStatus } : p));
      }
      setPedidoModal(null); showToast('Pedido registrado');
    } catch (e) { console.error(e); showToast('Não foi possível registrar o pedido'); }
  };
  const avancarPedido = async (p, novoStatus) => {
    try {
      if (!offline) await api.updatePedidoStatus(p.id, novoStatus);
      setPedidos(pedidos.map(x => x.id === p.id ? { ...x, status: novoStatus } : x));
      showToast(`Pedido marcado como ${novoStatus}`);
    } catch (e) { console.error(e); showToast('Não foi possível atualizar'); }
  };
  const cancelarPedido = async (p) => {
    try {
      if (!offline) await api.updatePedidoStatus(p.id, 'Cancelado');
      setPedidos(pedidos.map(x => x.id === p.id ? { ...x, status: 'Cancelado' } : x));
      showToast('Pedido cancelado');
    } catch (e) { console.error(e); showToast('Não foi possível cancelar'); }
  };
  const saveDespesa = async (data) => {
    try {
      const criada = offline ? { ...data, id: Date.now() } : await api.createDespesa(data);
      setDespesas([criada, ...despesas]); setDespesaModal(null); showToast('Despesa salva');
    } catch (e) { console.error(e); showToast('Não foi possível salvar a despesa'); }
  };
  const deleteDespesa = async (id) => {
    try { if (!offline) await api.deleteDespesa(id); setDespesas(despesas.filter(d => d.id !== id)); showToast('Despesa removida'); }
    catch (e) { console.error(e); showToast('Não foi possível excluir'); }
  };

  if (view === 'login') {
    return (
      <div className="nv-root">
        <LoginScreen onLogin={fazerLogin} onVoltar={() => setView('site')} error={loginError} loading={loginLoading} offline={offline} onDemoAccess={() => setView('admin')} />
      </div>
    );
  }

  if (view === 'admin') {
    if (!authChecked) {
      return <div className="nv-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}><Loader2 size={22} style={{ animation: 'nvspin 1s linear infinite' }} /></div>;
    }
    if (!session && !offline) { setView('login'); return null; }
    return (
      <div className="nv-root nv-admin-shell">
        <aside className="nv-sidebar">
          <AdminSidebarContent adminTab={adminTab} setAdminTab={setAdminTab} setView={setView} onLogout={fazerLogout} email={session?.user?.email} />
        </aside>
        {sidebarMobile && (
          <div className="nv-mobile-sidebar-overlay" onClick={() => setSidebarMobile(false)}>
            <div className="nv-mobile-sidebar" onClick={e => e.stopPropagation()}>
              <AdminSidebarContent adminTab={adminTab} setAdminTab={setAdminTab} setView={setView} onLogout={fazerLogout} email={session?.user?.email} onNavigate={() => setSidebarMobile(false)} />
            </div>
          </div>
        )}
        <div className="nv-admin-main">
          <div className="nv-admin-topbar">
            <button className="nv-icon-btn" onClick={() => setSidebarMobile(true)}><Menu size={22} /></button>
            <span style={{ fontFamily: 'Anton, sans-serif' }}>NVS Street</span>
            <div style={{ width: 22 }} />
          </div>
          <div className="nv-admin-content">
            {offline && <div className="nv-warning" style={{ textTransform: 'none' }}><AlertTriangle size={14} /> Supabase não configurado — dados de demonstração, nada salvo de verdade.</div>}
            {adminTab === 'dashboard' && <Dashboard counts={counts} receitaMes={receitaMes} pedidosPendentes={pedidosPendentes} clienteNome={clienteNome} produtoNome={produtoNome} />}
            {adminTab === 'produtos' && <ProdutosPanel produtos={produtos} pedidos={pedidos} onNew={() => setProdutoModal({})} onEdit={setProdutoModal} onDelete={deleteProduto} />}
            {adminTab === 'clientes' && <ClientesPanel clientes={clientes} pedidos={pedidos} onNew={() => setClienteModal({})} onEdit={setClienteModal} onDelete={deleteCliente} />}
            {adminTab === 'pedidos' && <PedidosPanel pedidos={pedidos} clienteNome={clienteNome} produtoNome={produtoNome} onNew={() => setPedidoModal({})} onAvancar={avancarPedido} onCancelar={cancelarPedido} />}
            {adminTab === 'financeiro' && <FinanceiroPanel pedidos={pedidos} despesas={despesas} onNovaDespesa={() => setDespesaModal({})} onDeleteDespesa={deleteDespesa} />}
          </div>
        </div>

        {produtoModal !== null && <ProdutoForm data={produtoModal} onSave={saveProduto} onClose={() => setProdutoModal(null)} offline={offline} />}
        {clienteModal !== null && <ClienteForm data={clienteModal} onSave={saveCliente} onClose={() => setClienteModal(null)} />}
        {pedidoModal !== null && <PedidoForm data={pedidoModal} produtos={produtos.filter(p => p.estoque > 0)} clientes={clientes} onSave={savePedido} onClose={() => setPedidoModal(null)} />}
        {despesaModal !== null && <DespesaForm data={despesaModal} onSave={saveDespesa} onClose={() => setDespesaModal(null)} />}
        {toast && <div className="nv-toast" style={{ textTransform: 'none' }}>{toast}</div>}
      </div>
    );
  }

  return (
    <div className="nv-root">
      <div className="nv-topbar">
        <div className="nv-wrap nv-topbar-inner">
          <div className="nv-topbar-item"><Truck size={13} /> Frete grátis acima de <span className="accent">R$199</span></div>
          <div className="nv-topbar-item"><Percent size={13} /> <span className="accent">5% off</span> <span className="hide-sm">no pix</span></div>
          <div className="nv-topbar-item"><MessageCircle size={13} /> Atendimento <span className="hide-sm">via WhatsApp</span></div>
        </div>
      </div>

      <header className="nv-header">
        <div className="nv-wrap nv-nav">
          <div className="nv-brand">NVS</div>
          <div className="nv-navlinks">
            <a href="#catalogo">Início</a>
            <a href="#marcas">Marcas</a>
            <a href="#catalogo">Roupas</a>
            <a href="#como-funciona">Como comprar</a>
            <a href="#contato">Contato</a>
          </div>
          <div className="nv-nav-icons">
            <button className="nv-btn-ghost" onClick={abrirAreaDaLoja} style={{ padding: '9px 14px', fontSize: '0.72rem' }}><Lock size={12} /> Loja</button>
            <button className="nv-cart-btn" onClick={() => setCartOpen(true)}>
              <ShoppingBag size={20} />
              {cartCount > 0 && <span className="nv-cart-count">{cartCount}</span>}
            </button>
            <button className="nv-menu-toggle" onClick={() => setMobileMenu(!mobileMenu)}>{mobileMenu ? <X size={22} /> : <Menu size={22} />}</button>
          </div>
        </div>
        {mobileMenu && (
          <div className="nv-mobile-menu">
            <a href="#catalogo" onClick={() => setMobileMenu(false)}>Início</a>
            <a href="#marcas" onClick={() => setMobileMenu(false)}>Marcas</a>
            <a href="#catalogo" onClick={() => setMobileMenu(false)}>Roupas</a>
            <a href="#como-funciona" onClick={() => setMobileMenu(false)}>Como comprar</a>
            <a href="#contato" onClick={() => setMobileMenu(false)}>Contato</a>
          </div>
        )}
      </header>

      <section className="nv-hero">
        <PhotoSlot
          tone="dark"
          loading="eager"
          label="Espaço reservado — foto do hero. Coloque o arquivo em /public/images/hero/hero-desktop.png"
          className="nv-hero-photo"
          src="/images/hero/hero-desktop.png"
        />
        <div className="nv-wrap nv-hero-grid">
          <div className="nv-hero-inner" style={{ padding: 0 }}>
            <div className="nv-eyebrow">Streetwear original · Hortolândia</div>
            <h1 className="nv-condensed">Atitude.<br />Originalidade.<br /><span className="nv-accent">Realidade.</span></h1>
            <p className="lede">As melhores marcas do streetwear você encontra na NVS.</p>
            <div className="nv-hero-actions">
              <a className="nv-btn nv-btn-red" href="#catalogo">Ver coleção <ChevronRight size={14} /></a>
              <a className="nv-btn-ghost" href={waLink(WA_MSG_GERAL)} target="_blank" rel="noopener noreferrer">Falar no WhatsApp</a>
            </div>
          </div>
        </div>
      </section>

      <section className="nv-brands-strip" id="marcas">
        <div className="nv-wrap">
          <h2 className="nv-condensed">Marcas em destaque</h2>
          <div className="nv-brands-row">
            {BRANDS.map(b => {
              if (b.variant === 'serif') return <div key={b.nome} className="nv-brand-word serif">{b.nome}</div>;
              if (b.variant === 'flagblock') return (
                <div key={b.nome} className="nv-brand-word flagblock">
                  <span className="chip" style={{ background: '#DA291C' }}></span>
                  <span className="chip" style={{ background: '#fff' }}></span>
                  <span className="chip" style={{ background: '#002F6C' }}></span>
                  {b.nome}
                </div>
              );
              if (b.variant === 'italicwide') return <div key={b.nome} className="nv-brand-word italicwide">{b.nome}</div>;
              if (b.variant === 'condensed') return <div key={b.nome} className="nv-brand-word condensed">{b.nome}</div>;
              return <div key={b.nome} className="nv-brand-word">{b.nome}</div>;
            })}
          </div>
        </div>
      </section>

      <section className="nv-wrap" style={{ padding: '40px 0 10px' }}>
        <div className="nv-cattiles-grid">
          {CATEGORY_TILES.map(c => (
            <div className="nv-cattile" key={c} onClick={() => { setFiltroCategoria(c); document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' }); }}>
              <div className="circle">
                <PhotoSlot tone="dark" label="" src={`/images/categorias/${slugify(c)}.webp`} />
              </div>
              <div className="label">{c}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="nv-wrap" id="catalogo" style={{ padding: '44px 0 40px' }}>
        <div className="nv-section-head">
          <h2 style={{ fontSize: 'clamp(1.6rem,3.4vw,2.2rem)' }}>Produtos em destaque</h2>
          <p style={{ textTransform: 'none', fontFamily: 'Inter' }}>Estoque real — o que está aqui, está disponível pra sair hoje.</p>
        </div>
        <div className="nv-filters">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-2)', border: '1px solid var(--line)', padding: '9px 14px' }}>
            <Search size={14} style={{ opacity: 0.5 }} />
            <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar produto, marca ou cor" style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)', fontSize: '0.85rem', width: 170 }} />
          </div>
          <select className="nv-select" style={{ width: 'auto' }} value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}>
            <option>Todas</option>{CATEGORIAS.map(c => <option key={c}>{c}</option>)}
          </select>
          <select className="nv-select" style={{ width: 'auto' }} value={filtroTamanho} onChange={e => setFiltroTamanho(e.target.value)}>
            <option>Todos</option>{TAMANHOS.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="nv-grid">
          {catalogo.map(p => {
            const desconto = p.precoAntigo && p.precoAntigo > p.preco ? Math.round(100 - (p.preco / p.precoAntigo) * 100) : null;
            const isFav = favorites.has(p.id);
            return (
              <div className="nv-card nv-card-v2" key={p.id}>
                <div className="nv-swatch">
                  <PhotoSlot tone="light" src={p.imagemUrl} alt={p.nome} label={`Foto pendente — ${p.nome}`} />
                  {desconto && <span className="nv-discount-badge">-{desconto}%</span>}
                  <button className={`nv-fav-btn ${isFav ? 'active' : ''}`} onClick={() => toggleFavorite(p.id)}><Heart size={14} fill={isFav ? 'currentColor' : 'none'} /></button>
                  <span className="tag">{p.tamanho}</span>
                  {p.status === 'Esgotado' && <div className="nv-soldout-stamp">Esgotado</div>}
                </div>
                <div className="nv-card-body">
                  {p.marca && <div className="brand">{p.marca}</div>}
                  <div className="name">{p.nome}</div>
                  <div className="occ">{p.cor}</div>
                  <div className="nv-price-row">
                    <span className="price">{brl(p.preco)}</span>
                    {desconto && <span className="old">{brl(p.precoAntigo)}</span>}
                  </div>
                  <div className="nv-installments">{installmentText(p.preco)}</div>
                  {p.status === 'Esgotado'
                    ? <div className="nv-badge-no">Esgotado</div>
                    : <div className="nv-badge-ok">{p.status}</div>}
                  <button
                    className="nv-btn nv-btn-red nv-add-cart-btn"
                    disabled={p.status === 'Esgotado' || p.estoque <= 0}
                    onClick={() => addToCart(p)}
                  >
                    <ShoppingBag size={13} /> Adicionar
                  </button>
                </div>
              </div>
            );
          })}
          {catalogo.length === 0 && <div className="nv-empty" style={{ gridColumn: '1/-1' }}>Nenhum produto encontrado com esses filtros.</div>}
        </div>
      </section>

      <section className="nv-badges-row">
        <div className="nv-wrap nv-badges-grid">
          <div className="nv-badge-item"><CreditCard size={20} /><div><b>Produtos originais</b><small>Só trabalhamos com marcas oficiais</small></div></div>
          <div className="nv-badge-item"><Percent size={20} /><div><b>Até 12x sem juros</b><small>Parcele suas compras com segurança</small></div></div>
          <div className="nv-badge-item"><RefreshCw size={20} /><div><b>Troca fácil</b><small>Troque em até 7 dias após o recebimento</small></div></div>
          <div className="nv-badge-item"><Lock size={20} /><div><b>Compra segura</b><small>Seus dados protegidos do início ao fim</small></div></div>
        </div>
      </section>

      <section className="nv-lifestyle">
        <div className="nv-wrap">
          <div className="nv-lifestyle-head">
            <h2 className="nv-condensed">Estilo NVS</h2>
            <div className="sub">Da quebrada para o mundo</div>
          </div>
          <div className="nv-lifestyle-grid">
            {LIFESTYLE_LOOKS.map(l => (
              <div className="nv-lifestyle-tile" key={l.id}>
                <PhotoSlot tone="dark" src={`/images/lifestyle/look-0${l.id}.webp`} label={`Foto lifestyle pendente — ${l.label}`} />
                <span className="nv-lifestyle-tag">Ver look</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="nv-how" id="como-funciona">
        <div className="nv-wrap">
          <h2 style={{ marginBottom: 36, fontSize: 'clamp(1.6rem,3.4vw,2.2rem)' }}>Como comprar</h2>
          <div className="nv-steps">
            <div className="nv-step"><div className="num">01</div><h3>Monta a sacola</h3><p>Adiciona quantas peças quiser direto no catálogo.</p></div>
            <div className="nv-step"><div className="num">02</div><h3>Fecha no WhatsApp</h3><p>A sacola vira uma mensagem pronta com todos os itens e o total.</p></div>
            <div className="nv-step"><div className="num">03</div><h3>Retira ou recebe</h3><p>Combina pagamento, entrega ou retirada direto na conversa.</p></div>
          </div>
        </div>
      </section>

      <section className="nv-insta">
        <div className="nv-wrap nv-insta-grid">
          <div className="nv-insta-info">
            <div className="nv-insta-icon"><Instagram size={20} /></div>
            <div>
              <h3 className="nv-condensed">Siga a NVS</h3>
              <p>Conteúdos exclusivos, lançamentos e muito estilo.</p>
              <div className="handle">@nvs.street</div>
            </div>
          </div>
          <div className="nv-insta-thumbs">
            {[1, 2, 3, 4, 5].map(i => (
              <div className="nv-insta-thumb" key={i}><PhotoSlot tone="dark" src={`/images/instagram/post-0${i}.webp`} label="" /></div>
            ))}
          </div>
        </div>
      </section>

      <section className="nv-whatsapp-banner">
        <div className="nv-wrap nv-wb-inner">
          <div className="nv-wb-left">
            <div className="nv-wb-icon"><MessageCircle size={22} color="#fff" /></div>
            <div>
              <h3 className="nv-condensed">Compre pelo WhatsApp</h3>
              <p>Atendimento rápido e personalizado</p>
            </div>
          </div>
          <a className="nv-btn nv-btn-red" href={waLink(WA_MSG_GERAL)} target="_blank" rel="noopener noreferrer">Falar no WhatsApp</a>
        </div>
      </section>

      <footer className="nv-footer" id="contato">
        <div className="nv-wrap">
          <div className="nv-foot-grid">
            <div>
              <div className="nv-brand" style={{ fontSize: '1.2rem', marginBottom: 12 }}>NVS</div>
              <p>Streetwear original em Hortolândia — curadoria de marcas como Lacoste, Casablanca, Tommy Hilfiger e mais. Sem lookbook, estoque real.</p>
            </div>
            <div>
              <div className="nv-label-small">Contato</div>
              <p><Instagram size={13} style={{ verticalAlign: 'middle', marginRight: 6 }} />@nvs.street</p>
              <p><MessageCircle size={13} style={{ verticalAlign: 'middle', marginRight: 6 }} />(19) 99316-0867</p>
            </div>
            <div>
              <div className="nv-label-small">Fale com a gente</div>
              <a className="nv-btn nv-btn-red" href={waLink(WA_MSG_GERAL)} target="_blank" rel="noopener noreferrer">Chamar no WhatsApp</a>
            </div>
          </div>
          <div className="nv-bottom-bar">
            <span>© NVS Street — protótipo desenvolvido por Caique Andrade</span>
          </div>
        </div>
      </footer>

      <a className="nv-whatsapp-fab" href={waLink(WA_MSG_GERAL)} target="_blank" rel="noopener noreferrer"><MessageCircle color="white" size={24} /></a>

      {cartOpen && <CartDrawer cart={cart} produtos={produtos} onClose={() => setCartOpen(false)} onQty={setQty} onRemove={removeFromCart} onCheckout={checkoutWhatsapp} />}
      {toast && <div className="nv-toast" style={{ textTransform: 'none' }}>{toast}</div>}
    </div>
  );
}
