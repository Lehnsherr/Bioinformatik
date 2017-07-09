import json
import numpy
from itertools import islice, count

faktor = 1


def viterbi(sequenz, zustaende, zustaende_wsl, uebergangs_wsl, emmisions_wsl):
    viterbi_list = [{}]
    opt_wsl = []
    opt_wsl_str = ""
    j = 0
    max_wsl = 0

    for zustand in zustaende:
        viterbi_list[0][zustand] = {"Wahrscheinlichkeit": numpy.float128((zustaende_wsl[zustand] * emmisions_wsl[zustand][sequenz[0]])*faktor), "vorher": None, "Index": j}

    for i in range(1, len(sequenz)):

        viterbi_list.append({})

        for zustand in zustaende:
            max_uebergangs_wsl = max(
                numpy.float128(viterbi_list[i-1][vorher_zustand]["Wahrscheinlichkeit"]*uebergangs_wsl[vorher_zustand][zustand]) for vorher_zustand in zustaende
            )

            for vorher_zustand in zustaende:

                if viterbi_list[i-1][vorher_zustand]["Wahrscheinlichkeit"] * uebergangs_wsl[vorher_zustand][zustand] == max_uebergangs_wsl:
                    j = j + 1
                    max_wsl = numpy.float128(max_uebergangs_wsl * emmisions_wsl[zustand][sequenz[i]])
                    viterbi_list[i][zustand] = {"Wahrscheinlichkeit": max_wsl, "vorher": vorher_zustand, "Index": j}

                    break

    for line in dptable(viterbi_list):
        print line

    # Hoehste Wahrscheinlichkeit berechnen
    max_wsl = max(value["Wahrscheinlichkeit"] for value in viterbi_list[-1].values())

    previous = None

    # Hoehste Wahrscheinlicher Zustand und seine Zurueckverfolgung
    for zustand, data in viterbi_list[-1].items():
        if data["Wahrscheinlichkeit"] == max_wsl:
            opt_wsl.append(zustand)

            previous = zustand

            break

    # Pfad zurueck verfolgen bis zur ersten Begegnung
    for i in range(len(viterbi_list) - 2, -1, -1):
        opt_wsl.insert(0, viterbi_list[i + 1][previous]["vorher"])
        previous = viterbi_list[i + 1][previous]["vorher"]

    opt_wsl_str = toStringMaxWsl(viterbi_list, previous)

    # print ' \n Die Abfolge der Zustaende ist \n '+' '.join(opt_wsl) + '\n mit der hoehsten Wahrscheinlichkeit von %s' % max_wsl + '\n'
    print ' \n Die Abfolge der Zustaende ist \n '+ opt_wsl_str + '\n mit der hoehsten Wahrscheinlichkeit von %s' % max_wsl + '\n'


def toStringMaxWsl(viterbi_list, previous):
    opt_to_string = ''
    for i in range(len(viterbi_list) - 2, -1, -1):
        previous = viterbi_list[i + 1][previous]["vorher"]

        if previous == 'ungezinkt':
            previous_str = 'F'
        elif previous == 'gezinkt':
            previous_str = 'L'

        opt_to_string = opt_to_string + previous_str

    return opt_to_string


def toStringTest(viterbi_list):
    for zustand in viterbi_list[0]:
            yield "%.20s: " % zustand + " ".join("%.20s" % ("%f" % viterbi_item[zustand]["Wahrscheinlichkeit"]) for viterbi_item in viterbi_list)


def dptable(viterbi_list):
    for zustand in viterbi_list[0]:
        # yield "%.20s: " % zustand + " ".join("%.20s" % ("%f" % viterbi_item[zustand]["Wahrscheinlichkeit"]) for viterbi_item in viterbi_list)
        yield zustand + " ".join('\n' + str(viterbi_item[zustand]["Index"]) + ' ' + str(viterbi_item[zustand]["Wahrscheinlichkeit"]) for viterbi_item in viterbi_list)


def readTxtFile(file_name):
    arr = []
    with open(file_name) as f:
        for line in f:
            arr.append(line)

    return arr


def readJsonFile(file_name):
    with open(file_name) as json_data:
        j_data = json.load(json_data)

    return j_data


def getSequenz(result_data, name):
    arr = []
    for line in result_data:
        arr = line.split()

        if (arr[0] == name):
            return list(arr[1])


def getZustaende(arr):
    zstd_arr = []

    for zstd in arr:
        zstd_arr.append(zstd)

    return zstd_arr


if __name__ == "__main__":
    result_data = readTxtFile('wuerfel.txt')

    wsl = readJsonFile('wsl_wuerfel.json')

    zustaende_wsl = wsl['Zustaende']
    uebergangs_wsl = wsl['Uebergangs']
    emmisions_wsl = wsl['Emmisionswsl']

    sequenz = getSequenz(result_data, 'zahlenfolge')
    zustaende = getZustaende(zustaende_wsl)

    print(sequenz)
    print(zustaende)
    print(zustaende_wsl)
    print(uebergangs_wsl)
    print(emmisions_wsl)

    viterbi(sequenz, zustaende, zustaende_wsl, uebergangs_wsl, emmisions_wsl)
