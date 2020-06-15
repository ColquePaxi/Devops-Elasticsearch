# Elasticsearch + APM + Kibana + NodeJS em Kubernetes (DevOps) 
---
Esse é um breve tutorial sobre implementação e deploy de uma aplicação em NodeJS gerando logs para APM integrado a Elasticsearch e Kibana. Além de "codar" o objetivo é entender alguns conceitos frente à essa implementação. 

Vamos simular um ambiente cloud (só que localmente, no próprio host). 

Abaixo uma breve jornada:
- Kubernetes (master e nodes)
- Cluster
- Minikube
- Pods
- Services
- Docker
- Elasticsearch
- Kibana
- APM
- Node JS
- Acessar Docker dentro de Kubernetes
- Buildar aplicações Docker dentro de Kubernetes
- Escalar Kubernetes

Estrutura do projeto:
<ol>
<li>HOST</li>
  <ol>
    <li>VM</li>
    <ol>
      <li>K8S-master</li>
      <li>K8S-node</li>
        <ol>
          <li>Pod</li>
          <li>Pod</li>
          <li>Pod</li>
          <li>Pod</li>
        </ol>
    </ol>
  </ol>
</ol>

Bora lá, então?

## Instalar o Minikube e um Cluster de Kubernetes no Host (branch: feature/get-started) 
- [x] Instalação do Minikube
  
  $ curl -Lo minikube https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64 \
  && chmod +x minikube
  
  $ sudo cp minikube /usr/local/bin && rm minikube

- [x] Instalação do Kubectl:

  $ curl -LO https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl

  $ sudo chmod +x kubectl && cp kubectl /usr/local/bin && rm kubectl
  
- [x] Criação da máquina virtual do projeto (a partir da pasta do projeto)
  
  $ mkdir 00-k8s_elk_node
  
  $ minikube start --cpus 2 --memory 4000
  
  $ kubectl cluster-info // Saída -> Kubernetes master is running at https://172.17.0.2:8443 

- [x] Testes:

    $ kubectl get pod

    $ kubectl get pod --all-namespaces // mostra os pods do próprio Kubernetes

    $ minikube dashboard // visualização gráfica (no browser) do Cluster

## Construindo a aplicação NodeJS integrada ao APM (branch: feature/app-node)
- [x] Desenvolver simples API RESTFul ou fazer um clone de https://github.com/waldemarnt/node-docker-example.git
- [x] Usar a biblioteca APM Node.JS Agent (capturar: requests, CPUs, memória e vários outros dados que depois serão *puxados pelo APM* e depois *visualizados no Kibana*)
- [x] Iniciar o Servidor APM dentro da aplicação NodeJS, apontando para o servidor nas mesmas configurações de http://apm-server:8200 definida na máquina docker (vamos usar o padrão)

## Entendendo as máquinas docker e suas integrações que rodarão dentro do Kubernetes 
Analisando os arquivos .yaml que criarão os PODs
- [x] Services (Entrypoint -> camada acima dos PODs que recebem as requisições e "roteiam" para os PODs disponíveis)
- [x] PODs (Agrupamento de máquinas docker)

## Criando a infraestrutura do Elasticsearch no Kubernetes dentro da VM (branch: feature/elastic)
- [x] $ kubectl create -f ./yaml/elasticsearch.yaml (instrução assíncrona)
- [x] Saiba o estado dessa criação assim:
 
  $ kubectl get pod (e verifique o STATUS = ContainerCreating)
  
  $ kubectl describe pod elasticsearch-0 (dessa forma você vê com mais detalhes)
  
  $ kubectl describe pod elasticsearch-0 (ao repetir o comando você vê o novo status, o andamento, onde está agora...)
  
  $ kubectl get pod (e verifique o STATUS = Running)
  
  $ kubectl logs -f elasticsearch-0 (monitora os logs no console)
  
  $ minikube dashboard (aí você vê o elasticsearch ativo lá)

  Se o POD criado não subir (der Erro, CrashLoopBackOff, qualquer cosia diferente de Running), delete-o com o comando abaixo e refaça o procedimento acima:
  
  $ minikube delete (isso apaga todo o deploy até o momento)

## Criando a infraestrutura do Kibana no Kubernetes dentro da VM (branch: feature/kibana)
- [x] $ kubectl create -f ./yaml/kibana.yaml (instrução assíncrona)
- [x] Saiba o estado dessa criação assim: 
  
  $ kubectl get pod (e verifique o STATUS = ContainerCreating)
  
  $ kubectl describe pod kibana-deployment-'hash' (dessa forma você vê com mais detalhes)
  
  $ kubectl describe pod kibana-deployment-'hash' (ao repetir o comando você vê o novo status, o andamento, onde está agora...)
  
  $ kubectl get pod (e verifique o STATUS = Running)
  
  $ kubectl logs -f kibana-deployment-'hash' (monitora os logs no console)
  
  $ minikube dashboard (aí você vê o kibana ativo lá)
  
- [x] Saiba em qual porta está rodando o Kibana 
  
  $ kubectl cluster-info
  
  $ kubectl get services -o wide
  
  Browser: https://IPDaVm:Porta (mostra a a interface do Kibana)
  
  Obs.: Não não abrir o browser, use o http ao invés do https.

## Criando a infraestrutura do APM no Kubernetes dentro da VM (branch: feature/apm)
- [x] $ kubectl create -f ./yaml/apm-server.yaml (instrução assíncrona)
- [x] Saiba o estado dessa criação assim: 
  
  $ kubectl get pod (e verifique o STATUS = ContainerCreating)
  
  $ kubectl describe pod apm-server-'hash' (dessa forma você vê com mais detalhes)
  
  $ kubectl describe pod apm-server-'hash' (ao repetir o comando você vê o novo status, o andamento, onde está agora...)
  
  $ kubectl get pod (e verifique o STATUS = Running)
  
  $ kubectl logs -f apm-server-'hash' (monitora os logs no console)
  
  $ minikube dashboard (aí você vê o APM ativo lá)

- Veja se o APM está ativo no Browser do Kibana (ou seja, "conversando" com o Kibana)
  - [x] http://IPDaVm:Porta (mostra a a interface do Kibana)
  - [x] Vá até o item APM
  - [x] Setup Instructions
  - [x] APM Server Status OK (tem que estar diferente de "APM Server has still not connected to Elasticsearch) 

## Desenvovlendo o DB e a API que será implantada no K8S (branch: feature/node-app-k8s)

- Configurar e executar a aplicação:
  Vá até a pasta do projeto: $ cd 00-k8s_elk_node/node-api-docker
  - Ambiente DEV (só vamos subir o container docker do banco de dados):
    - [x] Configurar as variáveis de ambiente: NODE_ENV=development  
    - [x] Gerar o código da aplicação (com base nas definições do package.json): $ yarn build "nome da aplicação opcional"
    - [x] Subir os containers de servidores: $ cd node-api-docker$ make up
    - [x] Subir a aplicação no Host consumindo o banco de dados no container: $ yarn dev (dê STOP no container da aplicação antes)
      
    Pronto!!!!
    Para desenvolver é mais fácil abrir a IDE, codar a API (sem tê-la num container nesse momento), porém já conectada aos containers (database, cache, etc., tudo que não seja a API).
    Vamos testar subindo a aplicação no Host pra ver se está ok (lembrando que o script do ambiente de produção é outro no package.json):
    A configuração do script start tem que estar assim:     
      "start": "pm2 start index.js --watch --no-daemon --node-args=\"-r esm -r dotenv/config\""
    - [x] $ yarn start (dê STOP no container da aplicação antes e/ou Ctrl + C no start dev que havia iniciado o servidor) 
    
    Isso vai criar um PROCESSO (no seu SO) que você pode verificar no seu PID (Linux/Mac).
    Quando você dá um Ctrl+C você sai do start mas ainda o processo fica ativo. Isso porque a função do PM2 é manter a aplicação no ar e com alta disponibilidade. Portanto, ele tentará fazer load balanced, réplica do processo e afins toda vez que você executar yarn start (com o -f no package.json na linha do script start)..
    Caso precise subir novamente a aplicação, primeiro delete os processos que subiram para a sua aplicação assim:
    
    - [x] $ pm2 ls (e veja o nome da aplicação que foi criada)
    - [x] $ pm2 delete index (caso index seja o nome da aplicação)
    - [x] $ yarn start (novamente) 

  Ambiente de PROD no CONTAINER DOCKER (vamos subir o container do banco de dados e outro container da aplicação):
    - [x] Acrescentar o service chamado api dentro do docker-compose.yml.
    - [x] Vamos subir a nova configuração do docker compose: $ make up
    - [x] Veja se agora você está com 2 containers ativos: $ docker ps (node:latest e mongo:4.2)
    - [x] Vamos ver o LOG e verificar que existem alguns probleminhas a serem resolvidos: $ make logs
      
      api    | 14:54:10 0|index  | MongoNetworkError: failed to connect to server [0.0.0.0:27017] on first connect [{ Error: connect ECONNREFUSED 0.0.0.0:27017
 
      Por que aconteceu isso? Porque faltou configurar a variável de ambiente DB_HOST com o IP do container docker do database (geralmente é o IP que se descobre executando um docker inspect no container). Mas se a gente "engessar o IP", toda vez que subir os containers teremos de configurar novamente o IP. 
 
      Para resolver: 
      
      - [x] Alterar o arquivo .env: de DB_HOST=0.0.0.0 para DB_HOST=db     (que é o nome do serviço descrito no docker-compose.yml) 
      - [x] Baixar os containers e subir novamente: $ make down && make up
 
      Verifique no browser se os endpoints estão ativos agora: 
      
      - [x] http://localhost:3001/hello  
      - [x] http://localhost:3001/users (consultando do DB - coloque alguns dados fake) 

## Configurando a Aplicação para enviar os dados de log para o APM (branch: feature/node-app-k8s-deploy)
- Fazer *build* da imagem dentro do Kubernetes
  - [ ] Posicione-se na pasta da aplicação NodeJS (./node-api-docker)
  - [ ] Instale o pacote do APM no seu módulo: $ yarn install elastic-apm-node
  - [ ] Acessar e posicionar o docker da VM através do nosso Host: $ eval $(minikube docker-env)
  - [ ] Configurar a variável de ambiente: $ export NODE_ENV=development
  - [ ] Mostrar todos os dockers que estão rodando dentro do Kubernetes: $ docker ps
  - [ ] Mostrar todas as imagens que estão dentro do Kubernetes: $ docker images ls
  - [ ] Fazer a build dentro da VM: $ docker build -t node-app-tutorial .
  - [ ] Ver se a imagem foi criada dentro da VM: $ docker images
  - [ ] No arquivo node.yaml -> spec -> template -> spec -> containers -> image: node-app-tutorial:latest
  - [ ] $ kubectl create -f ../yaml/node.yaml (instrução assíncrona)

- Saiba o estado dessa criação assim: 
  
  $ kubectl get pod (e verifique o STATUS = ContainerCreating)

  $ kubectl describe pod apm-server-'hash' (dessa forma você vê com mais detalhes)

  $ kubectl describe pod apm-server-'hash' (ao repetir o comando você vê o novo status, o andamento, onde está agora...)

  $ kubectl get pod (e verifique o STATUS = Running)

  $ kubectl logs -f node-app-deployment-db867649b-ldlhl (monitora os logs no console)

  $ minikube dashboard (aí você vê o APM ativo lá)

- Se deu algum erro na criação, ajuste e refaça assim:
  - [ ] $ kubectl get deployments --all-namespaces
  - [ ] $ kubectl delete -n default deployment node-app-deployment
  - [ ] $ kubectl delete -n default service node-app
  - [ ] Ajuste suas configurações de deployment
  - [ ] $ docker image rm ID_DA_IMAGEM

- Saiba em qual porta está rodando o Kibana
    
  $ kubectl get services -o wide
    
  Browser: http://IPDaVm:Porta/hello
  Browser: http://IPDaVm:Porta/users

- Checar se o APM está funcionando
  - [x] Browser -> Kibana -> APM -> Agent status -> Check agent status (se verde, os dados estão percorrendo o fluxo)

## Verificar no APM se os dados dos logs estão sendo enviados
- [ ] Kibana -> APM -> Services -> NodeApp (veja se a requisição testada anteriormente aparece)
- [ ] Kibana -> Discover (ver todos os logs que estão sendo gerados pela aplicação NodeApp)

## Escalar a aplicação (branch: feature/scale)
- [ ] $ kubectl scale --replicas 3 deployment node-app-deployment

  Mensagem de retorno: deployment.extensions/node-app-deplyment scaled
- [ ] $ minikube dashboard -> Pods (e veja que tem 3 node-app-deplyment rodando)

## Considerações Finais
Isso que acabamos de implementar é só o começo. Para um ambiente de produção existem outras preocupações que devem ser tomadas, por exemplo sobre segurança, ao qual não abordamos nesse tutorial. Portanto, a minha recomendação é que você busque aperfeiçoar essa implementação e siga no aprendizado contínuo.

## Referências 
- https://www.youtube.com/watch?v=CqLB-tBYB2Q
- https://github.com/waldemarnt/devops-resources
- https://github.com/waldemarnt/node-docker-example
- https://www.digitalocean.com/community/tutorials/how-to-set-up-an-elasticsearch-fluentd-and-kibana-efk-logging-stack-on-kubernetes-pt
- https://www.youtube.com/watch?v=z4Vmpc1BOx0

## Agradecimento especial 
Aproveito para agradecer ao Waldemar Neto do Dev Lab por toda contribuição e esforço que tem empenhado à comunidade.

