
const multiValueDelimiter = '###'
const imageMaxSizes = 100*1000 // Btyes
const popUpViewPersonBaseZIndex = 100000
const defaultAvatarUrl = './resources/default-avatar.jpg'

let randomId = () => `${Math.round(Math.random()*10E12)} r o t c e n o C y l i m a F`.split(' ').reverse().join('')

function popUpAddPerson(addSuccessCallback, { gender, target, asRole, targetGender } = {}) {
    let fieldFactoryReturnedValues = []
    bigPopUp('', {
        script: $popUp => {
            let $from = $('<form class="row g-3"></form>')
            fieldFactoryReturnedValues = [
                FieldInput$ElementFactory({type: 'STRING', name: 'Tên gọi', placeholder: 'Ví dụ: Ông Nguyễn Văn A', code: 'callname'}),
                FieldInput$ElementFactory((() => {
                    let result = {type: 'GENDER', name: 'Giới tính', code: 'gender'}
                    if (gender) {
                        Object.assign(result, {
                            value: gender, disabled: true
                        })
                    }
                    return result
                })()),
                FieldInput$ElementFactory({type: 'DATE', name: 'Ngày sinh', code: 'birthday'}),
                FieldInput$ElementFactory({type: 'LUNAR_DATE', name: 'Ngày mất', code: 'deathday'}),
                FieldInput$ElementFactory({type: 'PERSON', name: 'Vợ / Chồng', code: 'spouse'}),
                FieldInput$ElementFactory((() => {
                    let result = {type: 'PERSON', name: 'Bố', code: 'father'}
                    if (asRole == 'child' && targetGender == 'Nam') {
                        Object.assign(result, {
                            value: target,
                            disabled: true
                        })
                    }
                    return result
                })()),
                FieldInput$ElementFactory((() => {
                    let result = {type: 'PERSON', name: 'Mẹ', code: 'mother'}
                    if (asRole == 'child' && targetGender == 'Nữ') {
                        Object.assign(result, {
                            value: target,
                            disabled: true
                        })
                    }
                    return result
                })()),
                FieldInput$ElementFactory({type: 'IMAGE', name: 'Ảnh', code: 'avatar'})
            ]
            $from.append(fieldFactoryReturnedValues.map(i => i[0]))

            $popUp.find('.content').append($from)
        },
        hideCloseButton: true,
        buttons: [
            {
                html: 'Thoát',
                click: $popUp => {$popUp.remove(); $(document.body).removeClass('stop-scrolling')}
            },
            {
                html: 'Thêm người thân',
                type: 'success',
                click: $popUp => {
                    if (fieldFactoryReturnedValues.every(i => i[1]())) { // All fields valid
                        let data = fieldFactoryReturnedValues.map(i => i[2]())
                        api.addPerson({data, target, asRole}).then(() => {
                            $popUp.remove()
                            $(document.body).removeClass('stop-scrolling')
                            addSuccessCallback()
                        })
                    }
                }
            }
        ]
    })
}

function popUpPickPerson(callback, {isMultiValue, maleOnly, femaleOnly, exceptIds, pickedIds}) {
    isMultiValue = isMultiValue || false
    maleOnly = maleOnly || false
    femaleOnly = femaleOnly || false
    exceptIds = exceptIds || []
    exceptIds = new Set(exceptIds)
    pickedIds = pickedIds || []
    pickedIds = new Set(pickedIds)

    let getPickedPeople = null

    bigPopUp(`
        ${maleOnly ? '<h1>Danh sách người thân có giới tính Nam</h1>' : ''}
        ${femaleOnly ? '<h1>Danh sách người thân có giới tính Nữ</h1>' : ''}
        <input type="text" class="form-control find-person" placeholder="Nhập bất cứ thông tin gì về người muốn tìm...">
        <button class="btn btn-primary delete-all" style="margin: 1em 0; float: right;">Xóa tất cả người đã chọn</button>
        <table class="table border mb-0">
            <tbody>
            </tbody>
        </table>
    `,
    {
        zIndex: 120000,
        script: ($popUp, $content) => {
            api.getPeopleOfUserBaseInfo().then(people => {
                if (maleOnly) people = people.filter(({gender}) => gender == 'Nam')
                else if (femaleOnly) people = people.filter(({gender}) => gender != 'Nam')
                people = people.filter(({id}) => !exceptIds.has(id))
                
                let list$persons = []
                let rdName = randomId()

                people.forEach(person => {
                    let {id, callname, avatar, searchString} = person
                    let $person = $(`<tr class="align-middle">
                        <td style="width: 3em; position: relative;"><input class="form-check-input" type="${isMultiValue ? 'checkbox' : 'radio'}" style="position: absolute;
                            top: 50%; left: 50%; transform: translate(-50%, -50%); margin: 0;" ${isMultiValue ? '' : `name="${rdName}"`} ${pickedIds.has(id) ? 'checked' : ''}></td>
                        <td style="width: 3em;">
                            <div class="avatar avatar-md">
                                <img class="avatar-img" src="${avatar || defaultAvatarUrl}">
                            </div>
                        </td>
                        <td><div>${callname}</div></td>
                    </tr>`)

                    $content.find('tbody').append($person)
                    list$persons.push($person)

                    searchString = searchString.toLowerCase()
                    while (searchString.includes('  ')) searchString = searchString.replaceAll('  ', ' ').trim()
                    let searchString2 = new Set(searchString.split(' '))
                    let searchStringNormalized2 = new Set(searchString.split(' ').map(w => removeAccents(w)))
                    let searchStringNormalized = [...searchStringNormalized2].join(' ')

                    $person.score = (vs, nvs) => {
                        let score = 0
                        if ($person.find('input')[0].checked) {
                            score = 1
                        }

                        for (let v of nvs) {
                            if (searchStringNormalized.includes(v)) score += 5
                            if (searchStringNormalized2.has(v)) score += 10
                        }
                        for (let v of vs) {
                            if (searchString.includes(v)) score += 10
                            if (searchString2.has(v)) score += 20
                        }

                        return score
                    }

                    $person.choosed = () => $person.find('input')[0].checked
                    $person.getPerson = () => person
                })

                $content.find('.find-person').keyup(function () {
                    let value = $(this).val().trim().toLowerCase()
                    
                    while (value.includes('  ')) value = value.replaceAll('  ', ' ').trim()
                    let vs = [...new Set(value.split(' '))]
                    let nvs = [...new Set(vs.map(v => removeAccents(v)))]
                    
                    let scores = value == '' ? list$persons.map(_ => 1) : list$persons.map($person => $person.score(vs, nvs))
                    let indices = range(list$persons.length)
                    indices.sort((i1, i2) => scores[i2] - scores[i1])

                    scores = indices.map(i => scores[i])
                    list$persons = indices.map(i => list$persons[i])
                    list$persons.forEach($person => $person.hide())

                    for (let i of range(list$persons.length)) {
                        if (scores[i] == 0) list$persons[i].hide()
                        else $content.find('tbody').append(list$persons[i].show())
                    }
                })

                $content.find('.delete-all').click(() => list$persons.forEach($person => $person.find('input')[0].checked = false))

                getPickedPeople = () => list$persons.filter($person => $person.choosed()).map($person => $person.getPerson())
            })
        },
        hideCloseButton: true,
        buttons: [{
            html: 'Xác nhận',
            type: 'success',
            click: $popUp => {
                $popUp.remove()
                callback(getPickedPeople ? getPickedPeople() : [])
            }
        }]
    })
}

function FieldInput$ElementFactory({id, code, type, placeholder, name, description, isMultiValue, value, isForAllPeople, personId, disabled}, updateFieldDefinitionCallback) {
    value = value || ''
    let $element, validate, getValue, valueChanged
    let labelId = randomId()

    function dateValidation(s, isLunarDate = false, testSupportRange = false) {
        // Return [isValid, Message if not valid]
        if (!DateLib.isInValidForm(s)) {
            return [false, 'Sai định dạng NGÀY/THÁNG/NĂM!']
        }

        if (testSupportRange && (!DateLib.isDateInSupportRange(s))) {
            return [false, 'Đối với kiểu dữ liệu này, chỉ hỗ trợ ngày tháng từ năm 1801 đến năm 2198!']
        }

        if (!(isLunarDate ? DateLib.isValidLunarDate(s) : DateLib.isValidDate(s))) {
            return [false, 'Không tồn tại ngày tháng này!']
        }

        return [true]
    }

    if (isMultiValue) {
        
    }
    else {
        switch (type) {
            case 'STRING':
                $element = $(`<div class="col-12">
                    <label for="${labelId}" class="form-label">${name}${code == 'callname' ? '<span style="color: red;"> *</span>' : ''}</label>
                    <input type="text" class="form-control" id="${labelId}" ${placeholder ? `placeholder="${placeholder}"` : ''} ${value ? `value="${value}"` : ''}>
                    <div class="invalid-feedback"></div>
                </div>`)
                $element.find('input').keydown(() => {
                    $element.find('.invalid-feedback').hide()
                    $element.find('input').removeClass('is-invalid')
                })
                validate = () => {
                    if (code == 'callname' && $element.find('input').val() == '') {
                        $element.find('.invalid-feedback').show().html('Không được để trống thông tin này!')
                        $element.find('input').addClass('is-invalid')
                        return false
                    }
                    return true
                }
                getValue = () => $element.find('input').val()
                valueChanged = () => value != getValue()
                break
            case 'DATE':
                $element = $(`<div class="col-md-12">
                    <label for="${labelId}" class="form-label">${name}</label>
                    <input type="text" class="form-control" id="${labelId}" ${placeholder ? `placeholder="${placeholder}"` : 'placeholder="Ngày dương lịch định dạng NGÀY/THÁNG/NĂM"'} ${value ? `value="${value}"` : ''}>
                    <div class="invalid-feedback"></div>
                </div>`)
                $element.find('input').keydown(() => {
                    $element.find('.invalid-feedback').hide()
                    $element.find('input').removeClass('is-invalid')
                })
                validate = () => {
                    let val = $element.find('input').val()
                    if (val == '') return true

                    let [isValid, message] = dateValidation(val)

                    if (isValid) {
                        return true
                    }

                    $element.find('.invalid-feedback').show().html(message)
                    $element.find('input').addClass('is-invalid')

                    return false
                }
                getValue = () => {
                    let val = $element.find('input').val()
                    return val == '' ? '' : DateLib.shortenDateString(val)
                }
                valueChanged = () => value != getValue()
                break
            case 'LUNAR_DATE':
                let id1 = randomId(), id2 = randomId(), rdName = randomId()
                $element = $(`<div class="col-md-12">
                    <label for="${labelId}" class="form-label">${name}</label>
                    <div class="row" style="margin: 0;">
                        <div class="form-check col-md-6">
                            <input class="form-check-input" type="radio" id="${id1}" name="${rdName}">
                            <label class="form-check-label" for="${id1}">
                                Dương lịch
                            </label>
                        </div>
                        <div class="form-check col-md-6">
                            <input class="form-check-input" type="radio" id="${id2}" name="${rdName}" checked>
                            <label class="form-check-label" for="${id2}">
                                Âm lịch
                            </label>
                        </div>
                    </div>
                    <input type="text" class="form-control" id="${labelId}" ${placeholder ? `placeholder="${placeholder}"` : 'placeholder="Ngày âm lịch định dạng NGÀY/THÁNG/NĂM"'} ${value ? `value="${value}"` : ''}>
                    <div class="invalid-feedback"></div>
                </div>`)

                let $input = $element.find(`#${labelId}`)
                let $feedBack = $element.find('.invalid-feedback')

                $input.keydown(() => {
                    $feedBack.hide()
                    $input.removeClass('is-invalid')
                })

                $element.find(`#${id1}`).click(() => {
                    $input.attr('placeholder', 'Ngày dương lịch định dạng NGÀY/THÁNG/NĂM')
                    $feedBack.hide()
                    $input.removeClass('is-invalid')
                })
                $element.find(`#${id2}`).click(() => {
                    $input.attr('placeholder', 'Ngày âm lịch định dạng NGÀY/THÁNG/NĂM')
                    $feedBack.hide()
                    $input.removeClass('is-invalid')
                })
                validate = () => {
                    let val = $input.val()
                    if (val == '') return true
                    let isLunarDate = $element.find(`#${id2}`)[0].checked

                    let [isValid, message] = dateValidation(val, isLunarDate, true)

                    if (isValid) return true

                    $feedBack.show().html(message)
                    $input.addClass('is-invalid')
                    return false
                }
                getValue = () => {
                    let val = $input.val()
                    if (val == '') return ''
                    let isLunarDate = $element.find(`#${id2}`)[0].checked

                    return DateLib.shortenDateString(isLunarDate ? val : DateLib.dateToLunarDate(val))
                }
                valueChanged = () => value != getValue()
                break
            case 'GENDER':
                let alertText = ''
                if (!value) {
                    // Add person mode
                    alertText = 'Đây là thuộc tính quan trọng, ảnh hưởng đến hầu hết các chức năng của trang web!'
                } else {
                    // Edit person mode
                    alertText = 'Nếu giới tính bị thay đổi, mối quan hệ (bố / mẹ) của con cái người này sẽ bị xóa!'
                }
                let id3 = randomId(), id4 = randomId(), rdName2 = randomId()
                $element = $(`<div class="col-12">
                    <label for="${labelId}" class="form-label">${name} <span style="color: red;">*</span></label><br>
                    <h6 class="text-muted" style="margin-top: -0.5rem; margin-bottom: 1rem;">(${alertText})</h6>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="${rdName2}" id="${id3}" value="option1" ${disabled ? 'disabled' : ''}>
                        <label class="form-check-label" for="${id3}">
                            Nam
                        </label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="${rdName2}" id="${id4}" value="option2" ${disabled ? 'disabled' : ''}>
                        <label class="form-check-label" for="${id4}">
                            Nữ
                        </label>
                    </div>
                </div>`)
                if (value == 'Nữ') {
                    $element.find(`#${id4}`)[0].checked = true
                } else {
                    $element.find(`#${id3}`)[0].checked = true
                }
                validate = () => true
                getValue = () => $element.find(`#${id4}`)[0].checked ? 'Nữ' : 'Nam'
                valueChanged = () => value != getValue()
                break
            case 'PERSON':
                $element = $(`<div class="col-md-6">
                    <label for="${labelId}" class="form-label">${name}</label>
                    <div class="input-group" style="position: relative;">
                        <input type="text" class="form-control" value="Chọn..." readonly style="cursor: pointer;">
                        <button class="btn btn-outline-secondary" type="button" style="border-radius: var(--cui-btn-border-radius); border-top-left-radius: 0; border-bottom-left-radius: 0;" ${disabled ? 'disabled' : ''}>Chọn</button>
                        <div class="show-choosed-person" style="position: absolute; top: 0; bottom: 0; display: flex; align-items: center; z-index: 5;">
                            <img src="" style="height: 100%; padding: 0.6rem; margin: 0 0.2rem;" class="my-img">
                            <div class="name"></div>
                        </div>
                    </div>
                </div>`)
                $element.find('div.show-choosed-person').hide()
                $element.find('label').click(() => {
                    if (!choosedPersonId) $element.find('button').click()
                })
                let choosedPersonId = ''
                function displayChoosedPerson([person]) {
                    if (!person) return
                    choosedPersonId = person.id
                    $element.find('button').html('Xóa')
                    $element.find('div.show-choosed-person img').attr('src', person.avatar || defaultAvatarUrl)
                    $element.find('div.show-choosed-person .name').html(person.callname)
                    $element.find('div.show-choosed-person').show()
                    $element.find('input').addClass('show-choosed-person').val('')
                }
                $element.find('button').click(() => {
                    if (choosedPersonId != '') {
                        $element.find('button').html('Chọn')
                        choosedPersonId = ''
                        $element.find('input').val('Chọn...')
                        $element.find('div.show-choosed-person').hide()
                        $element.find('input').removeClass('show-choosed-person')
                    } else {
                        popUpPickPerson(displayChoosedPerson, {
                            isMultiValue,
                            maleOnly: code == 'father' ? true : false,
                            femaleOnly: code == 'mother' ? true : false,
                            exceptIds: (personId && ['father', 'mother', 'spouse'].includes(code)) ? [personId] : []
                        })
                    }
                })
                if (value && value != '') {
                    $element.find('input').val('Đang tải...')
                    $element.find('button').hide()
                    api.getPersonBaseInfo({id: value}).then(result => {
                        $element.find('input').val('Chọn...')
                        $element.find('button').show()
                        displayChoosedPerson([result])
                    })
                }
                validate = () => true
                getValue = () => choosedPersonId
                valueChanged = () => value != getValue()
                break
            case 'IMAGE':
                $element = $(`<div class="col-12">
                    <label for="${labelId}" class="form-label">${name}</label>
                    <div class="input-group mb-3">
                        <button class="btn btn-outline-secondary add-image" type="button">Tải ảnh lên</button>
                        <input type="text" class="form-control" id="${labelId}" value="Chưa có ảnh được chọn" readonly style="cursor: pointer">
                    </div>
                    <input type="file" style="display:none;" accept="image/*">
                    <div class="preview-image" style="">
                        <img src="" style="max-width: 100%; max-height: 15rem; border-radius: 0.375rem; border: 1px solid var(--cui-input-border-color, #b1b7c1); cursor: pointer;">
                        <button type="button" class="btn btn-danger delete-photo" style="display:block; margin-top: 1rem;">Xóa ảnh</button>
                    </div>
                </div>`)
                let imageUrl = ''

                $element.find('button.add-image').click(() => $element.find('input[type="file"]').click())
                $element.find('.preview-image').hide()
                $element.find('.preview-image img').click(function () { viewImage($(this).attr('src')) })

                $element.find('button.delete-photo').click(() => {
                    imageUrl = ''
                    $element.find('.input-group').show()
                    $element.find('.preview-image').hide()
                })
                function chooseImage(_imgUrl) {
                    imageUrl = _imgUrl
                    $element.find('.preview-image').show()
                        .find('img').attr('src', imageUrl)

                    $element.find('.input-group').hide()
                }
                $element.find('input[type="file"]').change(function () {
                    let input = this
                    if (input.files && input.files[0]) {
                        var reader = new FileReader();
                        reader.onload = function (e) {
                            imageUrl = e.target.result
                            resizeImage(imageUrl, imageMaxSizes).then(chooseImage)
                            input.value = ''
                        };
                        reader.readAsDataURL(input.files[0])
                    }
                })
                if (value) {
                    chooseImage(value)
                }

                validate = () => true
                getValue = () => imageUrl
                valueChanged = () => value != getValue()

                break
        }
    }

    let getValue2 = () => {
        return {
            value: getValue(),
            id, code
        }
    }

    let fieldDeleted = false

    let valueChanged2 = () => {
        if (fieldDeleted) return false
        return valueChanged()
    }

    if (!code) { // Custom field, so can be changed
        let $label = $element.find(`label[for="${labelId}"]`)

        function assignOperations() {
            let $operations = $(`<div style="display: inline-block; margin-left: 1rem;">
                <svg class="icon me-2 edit"><use xlink:href="./resources/@coreui/icons/svg/free.svg#cil-pen-alt"></use></svg>
            </div>`)
            .click(e => {
                e.preventDefault()
                e.stopPropagation()
            })

            $operations.find('svg').css({
                cursor: 'pointer'
            })

            $operations.find('svg.edit').click(() => {
                popUpEditField({id, name, description, isForAllPeople}, (newField) => {
                    let deleted = newField.deleted
                    if (deleted) {
                        fieldDeleted = true
                        $element.remove()
                        updateFieldDefinitionCallback(isForAllPeople)
                        return
                    }

                    name = newField.name
                    description = newField.description

                    // Handle description
                    // ....
                    
                    $label.html(newField.name)
                    assignOperations()

                    updateFieldDefinitionCallback(isForAllPeople)
                })
            })

            $label.append($operations)
        }

        assignOperations()
    }

    return [$element, validate, getValue2, valueChanged2]
}

function load(user) {
    function tabPeopleManager() {
        $('#tab-people-manager').html(`
            <button type="button" class="btn btn-primary" style="margin-bottom: 12px;" id="add-person">
                <svg class="icon">
                <use xlink:href="./resources/@coreui/icons/svg/free.svg#cil-user-plus"></use>
                </svg> Thêm người thân
            </button>
            <table class="table border mb-0">
                <thead class="table-light fw-semibold">
                <tr class="align-middle">
                    <th class="text-center">
                    <svg class="icon">
                        <use xlink:href="./resources/@coreui/icons/svg/free.svg#cil-people"></use>
                    </svg>
                    </th>
                    <th>Tên gọi</th>
                    <th class="text-center">Giới tính</th>
                    <th class="text-center">Ngày sinh</th>
                    <th class="text-center">Ngày mất</th>
                    <th class="text-center">Vợ/Chồng</th>
                    <th class="text-center">Bố</th>
                    <th class="text-center">Mẹ</th>
                </tr>
                </thead>
                <tbody id="list-people">
                </tbody>
            </table>

            <style>
                #tab-people-manager table thead tr th {
                background-color: darkgray;
                }
                #tab-people-manager table tbody {
                background-color: white;
                }
            </style>
        `)

        function refreshPeopleList() {
            api.getPeopleOfUserBaseInfo().then(people => {
                $("#list-people").html('')
                people.forEach(person => {
                    let {callname, gender, birthday, deathday, father, mother, avatar, spouse} = person
                    let $person = $(`<tr class="align-middle" style="cursor: pointer;">
                        <td class="text-center">
                            <div class="avatar avatar-md">
                                <img class="avatar-img my-img" src="${avatar || defaultAvatarUrl}">
                            </div>
                        </td>
                        <td>
                            <div>${callname}</div>
                        </td>
                        <td class="text-center">
                            <div class="fw-semibold">${gender}</div>
                        </td>
                        <td class="text-center">
                            <div class="fw-semibold">${birthday || '-'}</div>
                        </td>
                        <td class="text-center">
                            <div class="fw-semibold">${deathday || '-'}</div>
                        </td>
                        <td class="text-center">
                            ${spouse ? `<div class="avatar avatar-md">
                                <img class="avatar-img my-img" src="${spouse.avatar || defaultAvatarUrl}">
                            </div>` : '-'}
                        </td>
                        <td class="text-center">
                            ${father ? `<div class="avatar avatar-md">
                                <img class="avatar-img my-img" src="${father.avatar || defaultAvatarUrl}">
                            </div>` : '-'}
                        </td>
                        <td class="text-center">
                            ${mother ? `<div class="avatar avatar-md">
                                <img class="avatar-img my-img" src="${mother.avatar || defaultAvatarUrl}">
                            </div>` : '-'}
                        </td>
                    </tr>`)
        
                    $("#list-people").append($person)
    
                    $person
                    .on('mouseenter', function () { $(this).css('background-color', '#f7f7f9') })
                    .on('mouseleave', function () { $(this).css('background-color', 'white') })
                    .click(() => {
                        $(document.body).addClass('stop-scrolling')
                        updateCallbackStack[0] = refreshPeopleList
                        popUpViewPerson(person, 0, popUpViewPersonBaseZIndex, true)
                    })
                })
            })
        }
    
        refreshPeopleList()
    
        $('#add-person').click(() => {
            $(document.body).addClass('stop-scrolling')
            popUpAddPerson(function addSuccessCallback () {
                refreshPeopleList()
            })
        })
    }
    tabPeopleManager()

    $('#tab-people-manager')[0].load = tabPeopleManager
}
