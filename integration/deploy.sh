#!/bin/sh

#!/bin/sh

DIR=$( dirname $PWD )
VERSION=$( cat $DIR/pod_version )

echo "deploy version ${VERSION}"
# POD_CONFIG
IMG_NAME=dnssecure-srv-debian
POD_NAME=vpod-deploy-dnssecure-srv
GTE_NAME=dnssecure-bridge
#
REDIRECT_PORT_HTTP=533:533
#
#
NO_BUILD=
NO_KILL=
#
#

for arg in "$@"
do
    case $arg in
        -n=*|--name=*)
        IMG_NAME="${arg#*=}"
        shift
        ;;
        -p=*|--podname=*)
        POD_NAME="${arg#*=}"
        shift
        ;;
        -n=*|--network=*)
        GTE_NAME="${arg#*=}"
        shift
        ;;
        -b=*|--nobuild=*)
        NO_BUILD="${arg#*=}"
        shift
        ;;
        -v=*|--version=*)
        VERSION="${arg#*=}"
        shift
        ;;
        -k=*|--nokill=*)
        NO_KILL="${arg#*=}"
        shift
        ;;
        *)
        null=$1
        shift
        ;;
    esac
done

port=`echo "${REDIRECT_PORT}" | cut -d: -f 2`

# CHECK NETWORK BRIDGE
exists=`docker network ls | grep "${GTE_NAME}"`
if [ -z "${exists}" ]
then
	docker network create "${GTE_NAME}"
fi

if [ -z "$NO_KILL" ]
then

  # Kill PS
  pida=$( docker ps | grep ${POD_NAME}-${VERSION} | cut -d ' ' -f 1 )
  if [ "${#pida}" -eq "12" ]
  then
    echo "Kill pod : ${POD_NAME}"
    docker stop ${POD_NAME}-${VERSION}
    docker rm ${POD_NAME}-${VERSION}
  fi

fi

if [ -z "$NO_BUILD" ]
then
  # img
  img=$( docker image ls ${IMG_NAME}:${VERSION} | grep ${IMG_NAME} )
  if [ ! -z "${img}"  ]
  then
    echo "Remove old pod image : ${POD_NAME}:${VERSION}"
    docker image rm "${IMG_NAME}":"${VERSION}"
  fi

  echo "Build ..."
  docker build -t "${IMG_NAME}":"${VERSION}" "${DIR}"

fi

docker run -tid --name "${POD_NAME}"-"${VERSION}" \
  --privileged \
  --network "${GTE_NAME}" \
  -p ${REDIRECT_PORT_HTTP} \
  --volume $DIR/config:/etc/opensecuredns \
  "${IMG_NAME}":"${VERSION}"
