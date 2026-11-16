import {FormEvent, useEffect, useState} from 'react';

type Account = {user_id:number;tutor_id:number;name:string;email:string;contact:string|null};
type Animal = {id:number;name:string|null;species:string;code:string};
type Queue = {id:number;public_token:string;animal_id:number;appointment_type:string;symptoms:string|null;status:string;priority_level:number;emergency:boolean};
type Status = {status:string;contextual_position:number|null;estimate?:{status:string;p50_minutes?:number;p90_minutes?:number};notification?:{status:string}|null};
type Credentials = {access_token:string;role:string};
const API = import.meta.env.VITE_API_URL || '/api';

async function request<T>(path:string, token:string|null, method='GET', body?:unknown):Promise<T> {
  const response=await fetch(API+path,{method,headers:{...(body!==undefined?{'Content-Type':'application/json'}:{}),...(token?{Authorization:`Bearer ${token}`}:{})},body:body===undefined?undefined:JSON.stringify(body)});
  const data=await response.json().catch(()=>({detail:'Resposta inválida do servidor'}));
  if(!response.ok)throw Error(typeof data.detail==='string'?data.detail:`Erro HTTP ${response.status}`);
  return data as T;
}

const labels:Record<string,string>={PENDING_TRIAGE:'Aguardando avaliação veterinária',WAITING:'Na fila',CALLED:'Chamado',RETURNING:'Em retorno',READY:'Pronto para atendimento',IN_SERVICE:'Em atendimento',COMPLETED:'Atendimento concluído'};
export default function App(){
  const [token,setToken]=useState<string|null>(null);
  const [profile,setProfile]=useState<Account|null>(null);
  const [animals,setAnimals]=useState<Animal[]>([]);
  const [queues,setQueues]=useState<Queue[]>([]);
  const [status,setStatus]=useState<Record<number,Status>>({});
  const [mode,setMode]=useState<'login'|'register'>('login');
  const [name,setName]=useState('');const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [contact,setContact]=useState('');
  const [animalName,setAnimalName]=useState('');const [species,setSpecies]=useState('DOG');
  const [selectedAnimal,setSelectedAnimal]=useState('');const [appointmentType,setAppointmentType]=useState('CONSULTATION');const [symptoms,setSymptoms]=useState('');
  const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [message,setMessage]=useState('');
  async function refresh(auth:string){
    const [a,b,c]=await Promise.all([request<Account>('/me',auth),request<Animal[]>('/me/animals',auth),request<Queue[]>('/me/queue',auth)]);
    setProfile(a);setAnimals(b);setQueues(c);setSelectedAnimal(v=>v||String(b[0]?.id||''));
  }
  useEffect(()=>{if(!token)return;let active=true;
    const update=async()=>{try{const current=await request<Queue[]>('/me/queue',token);if(!active)return;setQueues(current);
      const pairs=await Promise.all(current.filter(q=>q.status!=='PENDING_TRIAGE').map(async q=>[q.id,await request<Status>(`/public/status/${encodeURIComponent(q.public_token)}`,null)] as const));
      if(active)setStatus(Object.fromEntries(pairs));}catch{/* mantém visualização anterior em queda temporária */}};
    void update();const timer=setInterval(()=>void update(),15000);return()=>{active=false;clearInterval(timer)};
  },[token]);
  async function act(action:()=>Promise<void>){setError('');setMessage('');setBusy(true);try{await action()}catch(e){setError(e instanceof Error?e.message:'Falha desconhecida')}finally{setBusy(false)}}
  async function authenticate(e:FormEvent){e.preventDefault();await act(async()=>{
    const route=mode==='register'?'/auth/register-tutor':'/auth/login';
    const data=await request<Credentials>(route,null,'POST',mode==='register'?{name,email,password,contact:contact||null}:{email,password});
    if(data.role!=='TUTOR')throw Error('Esta interface é exclusiva para contas de tutores.');
    await refresh(data.access_token);setToken(data.access_token);setPassword('');
  });}
  async function addAnimal(e:FormEvent){e.preventDefault();if(!token)return;await act(async()=>{
    await request('/me/animals',token,'POST',{name:animalName||null,species});await refresh(token);setAnimalName('');setMessage('Animal cadastrado.');
  });}
  async function enterQueue(e:FormEvent){e.preventDefault();if(!token)return;await act(async()=>{
    await request('/me/queue',token,'POST',{animal_id:Number(selectedAnimal),appointment_type:appointmentType,symptoms});
    await refresh(token);setSymptoms('');setMessage('Solicitação enviada. O veterinário irá avaliar a prioridade antes da entrada na fila.');
  });}
  function logout(){setToken(null);setProfile(null);setAnimals([]);setQueues([]);setStatus({});setMessage('');setError('');}
  return <main className="shell">
    <header><div><span className="eyebrow">CLÍNICA VETERINÁRIA</span><h1>Fila Virtual</h1><p>Atendimento sem precisar aguardar na recepção.</p></div>{profile&&<button className="secondary" onClick={logout}>Sair</button>}</header>
    {!profile?<section className="card auth"><h2>{mode==='login'?'Entrar como tutor':'Criar conta de tutor'}</h2><p>Faça login para cadastrar seu animal e solicitar atendimento remotamente.</p>
      <form onSubmit={authenticate}>
        {mode==='register'&&<><label>Nome completo<input required minLength={2} maxLength={120} value={name} onChange={e=>setName(e.target.value)} /></label><label>Contato<input maxLength={120} value={contact} onChange={e=>setContact(e.target.value)}/></label></>}
        <label>E-mail<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} /></label>
        <label>Senha<input required type="password" minLength={8} value={password} onChange={e=>setPassword(e.target.value)}/></label>
        <button disabled={busy} type="submit">{busy?'Processando...':mode==='login'?'Entrar':'Cadastrar e entrar'}</button>
      </form><button className="link" onClick={()=>{setMode(mode==='login'?'register':'login');setError('')}}>{mode==='login'?'Ainda não tenho conta':'Já tenho conta'}</button>
    </section>:<><p className="welcome">Olá, <b>{profile.name}</b>. Acompanhe os atendimentos dos seus animais.</p>
      <div className="columns"><section className="card"><h2>1. Cadastrar animal</h2><form onSubmit={addAnimal}>
        <label>Nome do animal<input value={animalName} onChange={e=>setAnimalName(e.target.value)} maxLength={120} placeholder="Opcional"/></label>
        <label>Espécie<select value={species} onChange={e=>setSpecies(e.target.value)}><option value="DOG">Cachorro</option><option value="CAT">Gato</option><option value="BIRD">Ave</option><option value="EXOTIC">Exótico</option><option value="OTHER">Outro</option></select></label>
        <button disabled={busy}>Cadastrar animal</button></form><div className="summary">Animais cadastrados: {animals.length}</div>
      </section><section className="card"><h2>2. Solicitar entrada na fila</h2><form onSubmit={enterQueue}>
        <label>Animal<select required value={selectedAnimal} onChange={e=>setSelectedAnimal(e.target.value)}><option value="" disabled>Selecione</option>{animals.map(a=><option value={a.id} key={a.id}>{a.name||a.code} ({a.species})</option>)}</select></label>
        <label>Tipo de atendimento<select value={appointmentType} onChange={e=>setAppointmentType(e.target.value)}><option value="CONSULTATION">Consulta</option><option value="VACCINE">Vacina</option><option value="RETURN">Retorno</option><option value="EXAM">Exame</option><option value="OTHER">Outro</option></select></label>
        <label>Descreva os sintomas<textarea required minLength={3} maxLength={2000} rows={4} value={symptoms} placeholder="Descreva o que está acontecendo com seu animal" onChange={e=>setSymptoms(e.target.value)}/></label>
        <p className="hint">Os sintomas serão analisados pela equipe veterinária; esta descrição não realiza triagem automática.</p>
        <button disabled={busy||!selectedAnimal}>Enviar solicitação</button>
      </form></section></div>
      <section className="card"><h2>3. Acompanhar solicitações</h2>{queues.length===0?<p>Nenhuma solicitação registrada.</p>:<div className="entries">{queues.map(q=><article className="entry" key={q.id}><div className="entry-head"><strong>Atendimento #{q.id} — {animals.find(a=>a.id===q.animal_id)?.name||'Animal'}</strong><span className="pill">{labels[q.status]||q.status}</span></div><div className="muted">{q.appointment_type}</div>{q.status==='PENDING_TRIAGE'?<p>Solicitação recebida. Aguarde a classificação do veterinário; ainda não há posição na fila.</p>:<p>Posição: <b>{status[q.id]?.contextual_position??'–'}</b> · Previsão: <b>{status[q.id]?.estimate?.status==='ok'?`${status[q.id].estimate?.p50_minutes}–${status[q.id].estimate?.p90_minutes} min`:'indisponível'}</b></p>}</article>)}</div>}</section>
    </>}
    {error&&<div className="alert error" role="alert">{error}</div>}{message&&<div className="alert good" role="status">{message}</div>}
    <footer>Fila Virtual · Projeto Integrador · A classificação clínica é responsabilidade do médico-veterinário.</footer>
  </main>;
}
