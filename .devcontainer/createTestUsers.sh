echo 'creating test users'
testuserfile='tmp/testuser.txt'
for i in `seq 1 5`
do
  username=test${i}
  email=${username}@gmail.com
  ret=$(bin/tootctl accounts create ${username} --email=${email} --confirmed)
  if [[ $ret =~ ^.+New\ password:\ ([0-9a-z]+) ]]
  then
    echo "${username}:${BASH_REMATCH[1]}:${email}" >> ${testuserfile}
  else
    echo $ret
  fi
done
echo "creating test users done. file=${testuserfile}"
cat ${testuserfile}
