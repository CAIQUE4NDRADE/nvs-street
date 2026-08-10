import { supabase } from './supabase';

// ---------- Produtos ----------
const produtoOut = (p) => ({
  id: p.id, codigo: p.codigo, nome: p.nome, categoria: p.categoria, cor: p.cor,
  tamanho: p.tamanho, preco: p.preco, precoAntigo: p.preco_antigo, marca: p.marca || '',
  imagemUrl: p.imagem_url || '', imagemUrl2: p.imagem_url_2 || '',
  custo: p.custo, estoque: p.estoque, status: p.status,
  fornecedor: p.fornecedor || '', observacoes: p.observacoes || '',
});
const produtoIn = (p) => ({
  codigo: p.codigo, nome: p.nome, categoria: p.categoria, cor: p.cor, tamanho: p.tamanho,
  preco: Number(p.preco) || 0,
  preco_antigo: p.precoAntigo === '' || p.precoAntigo == null ? null : Number(p.precoAntigo),
  marca: p.marca || null,
  imagem_url: p.imagemUrl || null,
  imagem_url_2: p.imagemUrl2 || null,
  custo: p.custo === '' || p.custo == null ? null : Number(p.custo),
  estoque: Number(p.estoque) || 0, status: p.status,
  fornecedor: p.fornecedor || null, observacoes: p.observacoes || null,
});

export async function listProdutos() {
  const { data, error } = await supabase.from('produtos').select('*').order('id');
  if (error) throw error;
  return data.map(produtoOut);
}
export async function createProduto(v) {
  const { data, error } = await supabase.from('produtos').insert(produtoIn(v)).select().single();
  if (error) throw error;
  return produtoOut(data);
}
export async function updateProduto(v) {
  const { data, error } = await supabase.from('produtos').update(produtoIn(v)).eq('id', v.id).select().single();
  if (error) throw error;
  return produtoOut(data);
}
export async function updateProdutoEstoque(id, estoque, status) {
  const { error } = await supabase.from('produtos').update({ estoque, status }).eq('id', id);
  if (error) throw error;
}
export async function deleteProduto(id) {
  const { error } = await supabase.from('produtos').delete().eq('id', id);
  if (error) throw error;
}

// ---------- Clientes ----------
const clienteOut = (c) => ({
  id: c.id, nome: c.nome, telefone: c.telefone || '', whatsapp: c.whatsapp || '',
  instagram: c.instagram || '', email: c.email || '', endereco: c.endereco || '',
  observacoes: c.observacoes || '',
});
const clienteIn = (c) => ({
  nome: c.nome, telefone: c.telefone || null, whatsapp: c.whatsapp || null,
  instagram: c.instagram || null, email: c.email || null, endereco: c.endereco || null,
  observacoes: c.observacoes || null,
});

export async function listClientes() {
  const { data, error } = await supabase.from('clientes').select('*').order('id');
  if (error) throw error;
  return data.map(clienteOut);
}
export async function createCliente(c) {
  const { data, error } = await supabase.from('clientes').insert(clienteIn(c)).select().single();
  if (error) throw error;
  return clienteOut(data);
}
export async function updateCliente(c) {
  const { data, error } = await supabase.from('clientes').update(clienteIn(c)).eq('id', c.id).select().single();
  if (error) throw error;
  return clienteOut(data);
}
export async function deleteCliente(id) {
  const { error } = await supabase.from('clientes').delete().eq('id', id);
  if (error) throw error;
}

// ---------- Pedidos ----------
const pedidoOut = (p) => ({
  id: p.id, clienteId: p.cliente_id, produtoId: p.produto_id, quantidade: p.quantidade,
  dataPedido: p.data_pedido, valor: p.valor, status: p.status,
});
const pedidoIn = (p) => ({
  cliente_id: p.clienteId, produto_id: p.produtoId, quantidade: Number(p.quantidade) || 1,
  data_pedido: p.dataPedido, valor: Number(p.valor) || 0, status: p.status,
});

export async function listPedidos() {
  const { data, error } = await supabase.from('pedidos').select('*').order('id');
  if (error) throw error;
  return data.map(pedidoOut);
}
export async function createPedido(p) {
  const { data, error } = await supabase.from('pedidos').insert({ ...pedidoIn(p), status: 'Pendente' }).select().single();
  if (error) throw error;
  return pedidoOut(data);
}
export async function updatePedidoStatus(id, status) {
  const { error } = await supabase.from('pedidos').update({ status }).eq('id', id);
  if (error) throw error;
}
export async function deletePedido(id) {
  const { error } = await supabase.from('pedidos').delete().eq('id', id);
  if (error) throw error;
}

// ---------- Despesas ----------
const despesaOut = (d) => ({
  id: d.id, descricao: d.descricao, categoria: d.categoria || '', valor: d.valor, data: d.data || '',
});
const despesaIn = (d) => ({
  descricao: d.descricao, categoria: d.categoria || null, valor: Number(d.valor) || 0, data: d.data || null,
});

export async function listDespesas() {
  const { data, error } = await supabase.from('despesas').select('*').order('data', { ascending: false });
  if (error) throw error;
  return data.map(despesaOut);
}
export async function createDespesa(d) {
  const { data, error } = await supabase.from('despesas').insert(despesaIn(d)).select().single();
  if (error) throw error;
  return despesaOut(data);
}
export async function deleteDespesa(id) {
  const { error } = await supabase.from('despesas').delete().eq('id', id);
  if (error) throw error;
}
