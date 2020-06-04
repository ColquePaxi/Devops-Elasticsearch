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
- [x] $ kubectl create -f ./yaml/elastic/elasticsearch.yaml (instrução assíncrona)
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
- [x] $ kubectl create -f ./yaml/elastic/kibana.yaml (instrução assíncrona)
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
- [ ] $ kubectl create -f ./yaml/elastic/apm-server.yaml (instrução assíncrona)
- [ ] Saiba o estado dessa criação assim: 
  
  $ kubectl get pod (e verifique o STATUS = ContainerCreating)
  
  $ kubectl describe pod apm-server-'hash' (dessa forma você vê com mais detalhes)
  
  $ kubectl describe pod apm-server-'hash' (ao repetir o comando você vê o novo status, o andamento, onde está agora...)
  
  $ kubectl get pod (e verifique o STATUS = Running)
  
  $ kubectl logs -f apm-server-'hash' (monitora os logs no console)
  
  $ minikube dashboard (aí você vê o APM ativo lá)

- Veja se o APM está ativo no Browser do Kibana (ou seja, "conversando" com o Kibana)
  - [ ] http://IPDaVm:Porta (mostra a a interface do Kibana)
  - [ ] Vá até o item APM
  - [ ] Setup Instructions
  - [ ] APM Server Status OK (tem que estar diferente de "APM Server has still not connected to Elasticsearch) 

## Configurando a Aplicação para enviar os dados de log para o APM (branch: feature/node-app-k8s)
- [ ] $ npm install elastic-apm-node

- Fazer *build* da imagem dentro do Kubernetes
  - [ ] Posicione-se na pasta da aplicação NodeJS (
  - [ ] Acessar e posicionar o docker da VM através do nosso Host: $ eval $(minikube docker-env)
  - [ ] Mostrar todos os dockers que estão rodando dentro do Kubernetes: $ docker ps
  - [ ] Mostrar todas as imagens que estão dentro do Kubernetes: $ docker images ls
  - [ ] Fazer a build dentro da VM: $ docker build -t node-app-tutorial
  - [ ] Ver se a imagem foi criada dentro da VM: $ docker images
  - [ ] No arquivo node.yaml -> spec -> template -> spec -> containers -> image: node-app-tutorial:latest
  - [ ] $ kubectl create -f ./yaml/node/node.yaml (instrução assíncrona)

- Saiba o estado dessa criação assim: 
  
  $ kubectl get pod (e verifique o STATUS = ContainerCreating)

  $ kubectl describe pod apm-server-'hash' (dessa forma você vê com mais detalhes)

  $ kubectl describe pod apm-server-'hash' (ao repetir o comando você vê o novo status, o andamento, onde está agora...)

  $ kubectl get pod (e verifique o STATUS = Running)

  $ kubectl logs -f apm-server-'hash' (monitora os logs no console)

  $ minikube dashboard (aí você vê o APM ativo lá)

- Se deu algum erro na criação, ajuste e refaça assim:
  - [ ] $ kubectl apply -f ./yaml/node/node.yaml (instrução assíncrona)

- Saiba em qual porta está rodando o Kibana
    
  $ kubectl get services -o wide
    
  Browser: http://IPDaVm:Porta/waldemarnt/followers

- Checar se o APM está funcionando
  - [ ] Browser -> Kibana -> APM -> Agent status -> Check agent status (se verde, os dados estão percorrendo o fluxo)

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
- https://github.com/waldemarnt/devops-resources/blob/master/./yaml/elasticsearch.yaml

## Agradecimento especial 
Aproveito para agradecer ao Waldemar Neto do Dev Lab por toda contribuição e esforço que tem empenhado à comunidade.
