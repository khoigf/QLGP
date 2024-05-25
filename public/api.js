
function FakeAPI() {
    const API_DELAY = 200
    const GEN = true
    const ABC = !GEN && false

    const NUM_ACCOUNTS = 1
    const RANGE_NPEOPLE_PER_ACCS = [100, 200]

    let l = console.log
    let random = (() => {
        let s = 0
        return () => {
            let x = Math.sin(s++)*10000
            return x - Math.floor(x)
        }
    })()
    let randInt = (a, b) => a + Math.floor(random()*(b - a + 1))
    let sample = (arr) => arr[Math.floor(random()*arr.length)]
    let sample_n = (arr, n) => {
        if (n > arr.length) return arr

        let indices = new Set()
        for (let i = 0; i < n; i++) {
            let index = randInt(0, arr.length - 1)
            while (indices.has(index)) {
                index = randInt(0, arr.length - 1)
            }
            indices.add(index)
        }
        let result = []
        for (let index of indices) result.push(arr[index])
        return result
    }
    function makeCopy(x, maxDepth = 5) {
        if (!x) return x
        if (maxDepth == 0) return x
        if (Array.isArray(x)) {
            return x.map(e => makeCopy(e, maxDepth - 1))
        }
        if (typeof x == 'object') {
            let result = {}
            for (let key in x) {
                result[key] = makeCopy(x[key], maxDepth - 1)
            }
            return result
        }
        return x
    }
    let existedId = new Set()
    let randomId = () => {
        let id = randInt(1, 2E9)
        while (existedId.has(id)) id = randInt(1, 2E9)
        existedId.add(id)
        return String(id)
    }

    let accounts = (() => {
        if (!GEN) return []

        let accounts = []
        for (let i = 0; i < NUM_ACCOUNTS; i++) {
            if (i == 0) i = 111111
            accounts.push({
                username: String(i),
                password: String(i),
                userId: randomId()
            })
        }

        return accounts
    })()

    let people = (() => {
        if (!GEN) return []

        let people = []
        for (let account of accounts) {
            let num_people = randInt(...RANGE_NPEOPLE_PER_ACCS)
            people.push({
                id: randomId(),
                ownerUserId: account.userId,
                isStandForUser: true
            })
            for (let i = 0; i < num_people - 1; i++) {
                people.push({
                    id: randomId(),
                    ownerUserId: account.userId,
                    isStandForUser: false
                })
            }
        }
        return people
    })()

    let fakeGenInf = (() => {
        if (!GEN) return {}

        const maleRate = 0.6
        const hasWifeRate = 0.5
        const nChrRange = [3, 5]
        let ids = people.map(({id}) => id)

        function idSample(n) {
            let _ids = sample_n(ids, n)
            let _ids2 = new Set(_ids)
            ids = ids.filter(id => !_ids2.has(id))
            return _ids
        }

        let [first] = idSample(1)
        let gens = [[first]]

        let spouse = {}
        let isMale = {}
        let father = {}
        let mother = {}

        while(ids.length != 0) {
            let pars = gens[gens.length - 1]
            let nextGens = []
            for (let par of pars) {
                let numChilds = Math.max(Math.ceil(randInt(nChrRange[0], nChrRange[1])*(gens.length - 1)/3), 1)
                let childsIds = idSample(numChilds)
                let parIsMale = !!isMale[par]
                let parParId = spouse[par]

                childsIds.forEach(id => {
                    let male = random() < maleRate
                    if (male) {
                        isMale[id] = true
                    }
                    let hasSpouse = (random() < hasWifeRate) && ids.length > 0
                    if (hasSpouse) {
                        let pnId = idSample(1)[0]
                        spouse[id] = pnId
                        spouse[pnId] = id
                        isMale[pnId] = !isMale[id]
                    }

                    let [faid, maid] = parIsMale ? [par, parParId] : [parParId, par]
                    father[id] = faid
                    mother[id] = maid

                    nextGens.push(id)
                })
            }

            gens.push(nextGens)
        }

        return {
            spouse, father, mother, isMale
        }
    })()

    let fDs = (() => {
        let fDs = [{
            id: randomId(),
            code: 'callname',
            name: 'Tên gọi',
            description: 'Đây là tên được hiển thị trong hầu hết tất cả các chức năng của trang web (vẽ biểu đồ gia phả, sự kiện sắp tới,...)',
            type: 'STRING',
            isMultiValue: false,
            isForAllPeople: true
        },
        {
            id: randomId(),
            code: 'gender',
            name: 'Giới tính',
            description: 'Giới tính',
            type: 'STRING',
            isMultiValue: false,
            isForAllPeople: true
        },
        {
            id: randomId(),
            code: 'spouse',
            name: 'Vợ/Chồng',
            description: 'Vợ hoặc là chồng, nói chung đây là ý chung nhân!',
            type: 'PERSON',
            isMultiValue: false,
            isForAllPeople: true,
            isForAllPeopleOfUserId: -1,
            isForAllPeopleOfUserId: -1
        },
        {
            id: randomId(),
            code: 'father',
            name: 'Bố',
            description: 'Bố ruột',
            type: 'PERSON',
            isMultiValue: false,
            isForAllPeople: true,
            isForAllPeopleOfUserId: -1
        },
        {
            id: randomId(),
            code: 'mother',
            name: 'Mẹ',
            description: 'Mẹ ruột',
            type: 'PERSON',
            isMultiValue: false,
            isForAllPeople: true,
            isForAllPeopleOfUserId: -1
        },
        {
            id: randomId(),
            code: 'birthday',
            name: 'Ngày sinh',
            description: 'Ngày sinh',
            type: 'DATE',
            isMultiValue: false,
            isForAllPeople: true,
            isForAllPeopleOfUserId: -1
        },
        {
            id: randomId(),
            code: 'deathday',
            name: 'Ngày mất',
            description: 'Ngày mất',
            type: 'LUNAR_DATE',
            isMultiValue: false,
            isForAllPeople: true,
            isForAllPeopleOfUserId: -1
        },
        {
            id: randomId(),
            code: 'avatar',
            name: 'Ảnh đại diện',
            description: 'Ảnh đại diện trực quan cho đối tượng trong hầu hết các chức năng của trang web',
            type: 'IMAGE',
            isMultiValue: false,
            isForAllPeople: true,
            isForAllPeopleOfUserId: -1
        }]

        if (!GEN) return fDs

        return fDs
    })()

    let fieldValues = (() => {
        if (!GEN) return []
        
        let fieldValues = []
        let ppStForUser = people.filter(({isStandForUser}) => isStandForUser)
        let isPPStForUser = new Set(ppStForUser.map(({id}) => id))
        let baseFields = fDs.filter(({code}) => code)

        for (let person of people) {
            let ppStandForUser = isPPStForUser.has(person.id)
            let callname = ppStandForUser ? 'Tôi' : `Nguyễn ${sample('ABCDEFGHIKLMN'.split(''))}${sample('123456789'.split(''))}`
            let gender = fakeGenInf.isMale[person.id] ? 'Nam' : 'Nữ'

            for (let field of baseFields) {
                let fieldValue = {}

                Object.assign(fieldValue, {
                    personId: person.id,
                    fieldDefinitionId: field.id,
                    fieldDefinitionCode: field.code,
                    value: {
                        callname: callname,
                        gender: gender,
                        father: fakeGenInf.father[person.id],
                        mother: fakeGenInf.mother[person.id],
                        spouse: fakeGenInf.spouse[person.id],
                        birthday: `${randInt(1, 28)}/${randInt(1, 12)}/${randInt(1900, 2100)}`,
                        deathday: `${randInt(1, 28)}/${randInt(1, 12)}/${randInt(1900, 2100)}`
                    }[field.code]
                })

                fieldValues.push(fieldValue)
            }

            person.searchString = callname + ' ' + gender
        }

        return fieldValues
    })()

    let upcomingEventTargetInfos = (() => {
        let result = []
        for (let account of accounts) {
            result.push({
                type: 0,
                userId: account.userId
            })
        }

        return result
    })()

    let accountDAO = (() => {
        let findByUserId = _userId => accounts.find(({userId}) => _userId == userId)
        let findByUn = _username => accounts.find(({username}) => _username == username)
        let crtAcc = (username, password) => {
            let account = {username, password, userId: randomId()}
            accounts.push(account)
            return account
        }

        return {
            findByUserId, findByUn, crtAcc
        }
    })()

    let fDDAO = (() => {
        let findById = (_id) => fDs.find(({id}) => id == _id)
        let findByCode = (_code) => fDs.find(({code}) => code == _code)
        let deleteById = (_id) => fDs = fDs.filter(({id}) => id != _id)

        return {
            findById, findByCode, deleteById
        }
    })()

    let personDAO = (() => {
        let getPOfUser = userId => people.filter(({ownerUserId}) => ownerUserId == userId)
        let findById = _id => people.find(({id}) => id == _id)

        let udSStr = (personId) => {
            let person = findById(personId)

            let feildValues = fVDAO.findFVOfPid(personId)
            let values = feildValues.filter(({fieldDefinitionId}) => {
                return ['STRING', 'DATE', 'LUNAR_DATE'].includes(fDDAO.findById(fieldDefinitionId).type)
            }).map(({value}) => value)

            person.searchString = values.join(' ')
        }

        let getDelInf = (id) => {
            let fieldValues= fVDAO.findFVOfPid(id)
            fieldValues = fieldValues.map(fV => {
                let fD = fDDAO.findById(fV.fieldDefinitionId)
                let newFD = Object.assign({...fV}, fD)
                return newFD
            })
            let person = findById(id)

            let motherId = fieldValues.find(({code}) => code == 'mother').value
            let fatherId = fieldValues.find(({code}) => code == 'father').value
            let spouseId = fieldValues.find(({code}) => code == 'spouse').value

            let pIdsToMother = motherId ? fVDAO.findPIdsSameMt(motherId).filter(_id => _id != id) : []
            let pIdsSameFather = fatherId ? fVDAO.findPIdsSameFt(fatherId).filter(_id => _id != id) : []

            return {
                ...person,
                fieldValues,
                mother: motherId ? getBaseInfo(motherId): undefined,
                father: fatherId ? getBaseInfo(fatherId): undefined,
                spouse: spouseId ? getBaseInfo(spouseId): undefined,
                siblings: {
                    sameFather: pIdsSameFather.map(id => getBaseInfo(id)),
                    sameMother: pIdsToMother.map(id => getBaseInfo(id))
                },
                children: fVDAO.getChildIds(id).map(id => getBaseInfo(id))
            }
        }

        let findPOfUSer = () => people.find(({isStandForUser}) => isStandForUser)

        let getBaseInfo = (id) => {
            let person = makeCopy(findById(id))
            for (let {fieldDefinitionCode, value} of fVDAO.findByFVOfPId(id)) {
                if (!value) {
                    continue
                }
                if (['father', 'mother', 'spouse'].includes(fieldDefinitionCode)) {
                    let bFVals = makeCopy(fVDAO.findByFVOfPId(value))
                    let desiredData = {id: value}
                    for (let {fieldDefinitionCode, value} of bFVals) {
                        if (['callname', 'avatar'].includes(fieldDefinitionCode)) {
                            desiredData[fieldDefinitionCode] = value
                        }
                    }
                    person[fieldDefinitionCode] = desiredData
                } else {
                    person[fieldDefinitionCode] = value
                }
            }
            return person
        }

        return {
            getPOfUser, findById, udSStr, getDelInf, findPOfUSer, getBaseInfo
        }
    })()

    let fVDAO = (() => {
        let findByFVOfPId = (id) => fieldValues.filter(({personId, fieldDefinitionCode}) => personId == id && fieldDefinitionCode)
        let findFVOfPid = (id) => fieldValues.filter(({personId}) => personId == id)
        let findPIdsSameMt = (motherId) => fieldValues.filter(({fieldDefinitionCode, value}) => fieldDefinitionCode == 'mother' && value == motherId).map(({personId}) => personId)
        let findPIdsSameFt = (fatherId) => fieldValues.filter(({fieldDefinitionCode, value}) => fieldDefinitionCode == 'father' && value == fatherId).map(({personId}) => personId)
        let getChildIds = (id) => fieldValues.filter(({fieldDefinitionCode, value}) => {
            return value == id && (fieldDefinitionCode == 'mother' || fieldDefinitionCode == 'father')
        }).map(({personId}) => personId)
        let delByFDefId = (id) => fieldValues = fieldValues.filter(({fieldDefinitionId}) => fieldDefinitionId != id)

        let findByFIdAndPId = (fDId, pId) => fieldValues.find(({personId, fieldDefinitionId}) => pId == personId && fieldDefinitionId == fDId)
        let findByFCodeAndPId = (fDCode, pId) => fieldValues.find(({personId, fieldDefinitionCode}) => pId == personId && fieldDefinitionCode == fDCode)

        return {
            findByFVOfPId, findFVOfPid, findPIdsSameMt, findPIdsSameFt, getChildIds, findByFIdAndPId, delByFDefId, findByFCodeAndPId
        }
    })()

    function genProm(data) {
        data = makeCopy(data)
        if (API_DELAY < 1) {
            let a = {
                then: (f) => {
                    f(data)
                    return a
                },
                catch: (f) => {
                    f('Error')
                    return a
                }
            }
            return a
        }

        return new Promise(function (resolve) {
            setTimeout(() => resolve(data), API_DELAY)
        })
    }

    function getLoggedUId() {
        return localStorage.getItem('lgUId')
    }

    return {
        getLoggedU: () => {
            let userId = getLoggedUId()
            if (userId) {
                let user = accountDAO.findByUserId(userId)
                if (user) {
                    let userCopy = {...user}
                    delete userCopy.password
                    return genProm({ ...user })
                }
            }
            return genProm({sub: null})
        },
        login: ({username, password}) => {
            let user = accountDAO.findByUn(username)
            if (!user || user.password != password) {
                return genProm({message: 'Unauthorized'})
            }
            localStorage.setItem('lgUId', user.userId)

            return genProm({message: 'OK'})
        },
        signUp: ({username, password}) => {
            let user = accountDAO.findByUn(username)
            if (user) {
                return genProm({message: 'Username existed'})
            }

            user = accountDAO.crtAcc(username, password)
            localStorage.setItem('lgUId', user.userId)
            return genProm({message: 'OK'})
        },
        getPPBsInf: () => {
            let lgUId = getLoggedUId()
            let people = personDAO.getPOfUser(lgUId)

            return genProm(people.map(({id}) => personDAO.getBaseInfo(id)))
        },
        getPBsInf: ({id}) => {
            return genProm(personDAO.getBaseInfo(id))
        },
        getPDeatilInf: ({id}) => {
            return genProm(personDAO.getDelInf(id))
        },
        addPerson: ({data, target, asRole}) => {
            let userId = getLoggedUId()
            let newPerson = {
                ownerUserId: userId,
                isStandForUser: false,
                id: randomId()
            }
            people.push(newPerson)

            data.forEach(({value, code}) => {
                let fD = fDDAO.findByCode(code)
                fieldValues.push({
                    personId: newPerson.id,
                    fieldDefinitionId: fD.id,
                    fieldDefinitionCode: code,
                    value
                })

                if (target && asRole == code && asRole != 'child') {
                    Object.assign(fVDAO.findByFIdAndPId(fD.id, target), {
                        value: newPerson.id
                    })
                }
            })

            personDAO.udSStr(newPerson.id)

            fDs.filter(({isForAllPeopleOfUserId}) => isForAllPeopleOfUserId == userId).forEach(({id}) => {
                fieldValues.push({
                    personId: newPerson.id,
                    fieldDefinitionId: id,
                    value: ''
                })
            })

            return genProm({message: 'OK'})
        },
        updateFieldValues: ({data}) => {
            let _personId = null
            data.forEach(({value, fieldDefinitionId, personId, fieldDefinitionCode}) => {
                _personId = personId
                let fieldValue = fieldDefinitionId ? fVDAO.findByFIdAndPId(fieldDefinitionId, personId) : fVDAO.findByFCodeAndPId(fieldDefinitionCode, personId)
                fieldValue.value = value
                if (fieldDefinitionCode == 'gender') {
                    fieldValues.forEach(fV => {
                        if (fV.value == personId && ['father', 'mother'].includes(fV.fieldDefinitionCode)) {
                            fV.value = ''
                        }
                    })
                }
            })

            personDAO.udSStr(_personId)

            return genProm({message: 'OK'})
        },
        addField: ({data}) => {
            let newField = Object.assign(data, {
                id: randomId(),
                isForAllPeopleOfUserId: data.isForAllPeople ? getLoggedUId() : -1
            })

            fDs.push(newField)
            let tgPIds = newField.isForAllPeople ? personDAO.getPOfUser(getLoggedUId()).map(({id}) => id) : [newField.personId]

            tgPIds.forEach(personId => {
                fieldValues.push({
                    personId,
                    fieldDefinitionId: newField.id
                })
            })

            return genProm({newFieldDef: newField})
        },
        updateField: ({data}) => {
            let newField = data
            Object.assign(fDDAO.findById(newField.id), newField)
            return genProm({message: 'OK'})
        },
        deleteField: ({id}) => {
            fDDAO.deleteById(id)
            fVDAO.delByFDefId(id)
            return genProm({message: 'OK'})
        },
        drawFTree: ({targetPersonId, level} = {level: 1}) => {
            if (!targetPersonId) {
                targetPersonId = personDAO.findPOfUSer().id
            }

            let lgUId = getLoggedUId()
            let people = personDAO.getPOfUser(lgUId).map(({id}) => personDAO.getBaseInfo(id))

            let idToPer = {}
            let childrenOf = {} 
            let motherOf = {} 
            let fatherOf = {} 
            people.forEach(person => {
                idToPer[person.id] = person
                childrenOf[person.id] = []
            })
            people.forEach(person => {
                if (person.mother) {
                    motherOf[person.id] = person.mother.id
                    childrenOf[person.mother.id].push(person.id)
                }
                if (person.father) {
                    fatherOf[person.id] = person.father.id
                    childrenOf[person.father.id].push(person.id)
                }

                
                if (person.spouse) {
                    Object.assign(person.spouse, idToPer[person.spouse.id])
                }
                person.children = []
            })
            
            let existedId = new Set()
            function addPerson(person, parent = null) {
                if (existedId.has(person.id)) return false
                existedId.add(person.id)

                if (parent) {
                    let partner = parent.gender == 'Nam' ? (person.mother?.id && idToPer[person.mother.id]) : (person.father?.id && idToPer[person.father.id])
                    parent.children.push({
                        child: person,
                        partner: partner
                    })
                }
                return true
            }

            let ancestor = idToPer[targetPersonId]
            let csdAncentIds = new Set([ancestor.id])
            let fmIdsGetChr = new Set()
            while (true) {
                if (ancestor.father && (!csdAncentIds.has(ancestor.father.id))) {
                    ancestor = idToPer[ancestor.father.id]
                } else if (level > 2 && ancestor.mother && (!csdAncentIds.has(ancestor.mother.id))) {
                    ancestor = idToPer[ancestor.mother.id]
                    fmIdsGetChr.add(ancestor.id)
                } else {
                    break
                }
                csdAncentIds.add(ancestor.id)
            }
            addPerson(ancestor)

            let result = {targetPersonId, ancestor}

            let list = [ancestor]
            while (list.length != 0) {
                let person = list.pop()
                
                if (person.gender == 'Nam' || level > 2) {
                    if (childrenOf[person.id]) {
                        childrenOf[person.id].map(childId => idToPer[childId]).forEach(child => {
                            if (addPerson(child, person)) {
                                list.push(child)
                            }
                        })
                    }
                }
            }

            return genProm(result)
        },
        getBsInfTgPeopleUCmEvts: () => {
            let lgUId = getLoggedUId()
            let {type, numGenerationsAbove, numGenerationsBelow, includeEqualGeneration, specificPersonIds} = upcomingEventTargetInfos.find(({userId}) => userId == lgUId)
            
            let peronIds
            let personInfos

            if (type == 0) {
                peronIds =  personDAO.getPOfUser(lgUId).map(({id}) => id)
            } else if (type == 1) {
                peronIds = (specificPersonIds && specificPersonIds != '') ? specificPersonIds.split(mulValDel) : []
            } else {
                let people = personDAO.getPOfUser(lgUId)
                let pBsInf = people.map(({id}) => personDAO.getBaseInfo(id))
                let idPStandForUser = null
                let mIdToBsInf = {}
                let mIdToSId = {}, idToFId = {}, idToMId = {}, idToCId = {}
                pBsInf.forEach(({id}) => idToCId[id] = [])
                pBsInf.forEach(person => {
                    let {id, mother, father, spouse, isStandForUser} = person
                    mIdToBsInf[id] = person
                    mIdToSId[id] = spouse?.id
                    idToFId[id] = father?.id
                    idToMId[id] = mother?.id
                    if (mother) idToCId[mother.id].push(id)
                    if (father) idToCId[father.id].push(id)
                    if (isStandForUser) idPStandForUser = id
                })

                let isMale = id => mIdToBsInf[id].gender == 'Nam'
                peronIds = []

                
                
                let visited = new Set()
                function travelsal(id, n, goUp) {
                    if (n < -numGenerationsAbove || n > numGenerationsBelow || (n == 0 && !includeEqualGeneration)) {
                        return
                    }
                    if (!id || visited.has(id)) {
                        return
                    }
                    visited.add(id)
                    peronIds.push(id)

                    if (isMale(id)) {
                        idToCId[id].forEach(cid => travelsal(cid, n + 1, false))
                        travelsal(mIdToSId[id], n, false)
                        if (goUp) {
                            travelsal(idToFId[id], n - 1, true)
                        }
                    } else {
                        if (type == 3) {
                            idToCId[id].forEach(cid => travelsal(cid, n + 1, false))
                            travelsal(mIdToSId[id], n, false)
                        }
                        if (goUp) {
                            travelsal(idToFId[id], n - 1, true)
                        }
                    }
                }
                travelsal(idPStandForUser, 0, true)

                personInfos = peronIds.map(id => mIdToBsInf[id])
            }

            if (!personInfos) {
                let people = personDAO.getPOfUser(lgUId)
                let pBsInf = people.map(({id}) => personDAO.getBaseInfo(id))
                let mIdToBsInf = {}
                pBsInf.forEach(person => mIdToBsInf[person.id] = person)
                personInfos = peronIds.map(id => mIdToBsInf[id])
            }
            
            return genProm(personInfos)
        },
        getUpCmEvtTgInf: () => {
            let lgUId = getLoggedUId()
            return genProm(makeCopy(upcomingEventTargetInfos.find(({userId}) => userId == lgUId)))
        },
        udUpcomingEvtTarInf: ({upcomingEventTargetInfo}) => {
            let lgUId = getLoggedUId()
            Object.assign(upcomingEventTargetInfos.find(({userId}) => userId == lgUId), upcomingEventTargetInfo)
            return genProm({message: 'OK'})
        }
    }
}

function API() {
    const BASE_API_URL = '.'
    const DEBUG = true

    function myFetch(path, data = {}, method = 'GET') {
        if (DEBUG) {
            console.log('Input', path, data)
        }
        return fetch(BASE_API_URL + path + ((method == 'GET' && Object.keys(data) != 0) ? '?' + Object.keys(data).map(k => `${k}=${data[k]}`).join('&') : ''), {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: method != 'GET' ? JSON.stringify(data || {}) : undefined
        })
        .then(res => res.json())
        .then(outData => {
            if (DEBUG) {
                console.log('Output', path, outData)
            }
            return outData
        })
    }

    return {
        getLoggedU: data => myFetch('/user', data),
        login: data => myFetch('/login', data, 'POST'),
        signUp: data => myFetch('/register', data, 'POST'),
        getPPBsInf: data => myFetch('/allInfo', data),
        getPBsInf: data => myFetch('/info', data),
        getPDeatilInf: data => myFetch('/detailInfo', data),
        addPerson: data => myFetch('/addRelative', data,'POST'),
        updateFieldValues: data => myFetch('/updateFValue', data,'POST'),
        addField: data => myFetch('/addField', data,'POST'),
        updateField: data => myFetch('/updateField', data,'POST'),
        deleteField: data => myFetch('/deleteField', data,'POST'),
        drawFTree: data => myFetch('/drawFTree', data,'POST'), 
        getBsInfTgPeopleUCmEvts: data => myFetch('/baseInfPPUComingEvts', data), 
        getUpCmEvtTgInf: data => myFetch('', data), 
        udUpcomingEvtTarInf: data => myFetch('', data) 
    }
}

let api = FakeAPI()
