def fwd_bkw(observations, states, start_prob, trans_prob, emm_prob, end_st):
    # forward part of the algorithm
    fwd = []
    f_prev = {}
    for i, observation_i in enumerate(observations):
        f_curr = {}
        for st in states:
            if i == 0:
                # base case for the forward part
                prev_f_sum = start_prob[st]
            else:
                prev_f_sum = sum(f_prev[k]*trans_prob[k][st] for k in states)

            f_curr[st] = emm_prob[st][observation_i] * prev_f_sum

        fwd.append(f_curr)
        f_prev = f_curr

    p_fwd = sum(f_curr[k] * trans_prob[k][end_st] for k in states)

    # backward part of the algorithm
    bkw = []
    b_prev = {}
    for i, observation_i_plus in enumerate(reversed(observations[1:]+(None,))):
        b_curr = {}
        for st in states:
            if i == 0:
                # base case for backward part
                b_curr[st] = trans_prob[st][end_st]
            else:
                b_curr[st] = sum(trans_prob[st][l] * emm_prob[l][observation_i_plus] * b_prev[l] for l in states)

        bkw.insert(0,b_curr)
        b_prev = b_curr

    p_bkw = sum(start_prob[l] * emm_prob[l][observations[0]] * b_curr[l] for l in states)

    # merging the two parts
    posterior = []
    for i in range(len(observations)):
        posterior.append({st: fwd[i][st] * bkw[i][st] / p_fwd for st in states})

    # assert p_fwd == p_bkw
    return fwd, bkw, posterior

"""
states = ('Healthy', 'Fever')
end_state = 'E'
obs = ('normal', 'cold', 'dizzy')
start_p = {'Healthy': 0.6, 'Fever': 0.4}
trans_p = {
   'Healthy': {'Healthy': 0.69, 'Fever': 0.3, 'E': 0.01},
   'Fever': {'Healthy': 0.4, 'Fever': 0.59, 'E': 0.01},
   }
emit_p = {
   'Healthy': {'normal': 0.5, 'cold': 0.4, 'dizzy': 0.1},
   'Fever': {'normal': 0.1, 'cold': 0.3, 'dizzy': 0.6},
   }
"""

# Pfad (gezinkt, ungezinkt) der Zahlenfolge 1266643
obs = ('1', '2', '6', '6', '6', '4', '3')
states = ('gez', 'ung')
end_state = 'E'
start_p = {'gez': 0.5, 'ung': 0.5}
trans_p = {
   'ung': {'gez': 0.94, 'ung': 0.05, 'E': 0.01},
   'gez': {'gez': 0.05, 'ung': 0.94, 'E': 0.01}
   }
emit_p = {
   'ung': {'1': 0.16666666, '2': 0.16666666,
           '3': 0.16666666, '4': 0.16666666,
           '5': 0.16666666, '6': 0.16666666},
   'gez': {'1': 0.1, '2': 0.1, '3': 0.1,
           '4': 0.1, '5': 0.1, '6': 0.5}
   }


def example():
    return fwd_bkw(obs,
                   states,
                   start_p,
                   trans_p,
                   emit_p,
                   end_state)


if __name__ == "__main__":
    example()

    for line in example():
        print(line)
